"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLogin } from "@/hooks/use-auth";
import { applyServerErrors, safeRedirect } from "@/lib/form-errors";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    login.mutate(values, {
      onSuccess: ({ data }) => {
        toast.success(`Welcome back, ${data.name.split(" ")[0]}!`);
        router.replace(safeRedirect(searchParams.get("redirect")));
      },
      onError: (error) => setFormError(applyServerErrors(error, form.setError)),
    });
  });

  const redirect = searchParams.get("redirect");

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}

      <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...form.register("email")} />
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        aside={
          <Link href="/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        }
        {...form.register("password")}
      />

      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <Controller
          control={form.control}
          name="remember"
          render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
        />
        Keep me signed in
      </label>

      <Button type="submit" disabled={login.isPending} className="h-12 w-full rounded-full text-base">
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"}
          className="font-medium text-foreground underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
