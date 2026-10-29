"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/form-errors";

const schema = z
  .object({
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters."),
    password_confirmation: z.string(),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords don't match.",
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: searchParams.get("email") ?? "", password: "", password_confirmation: "" },
  });
  const reset = useMutation({
    mutationFn: (values: Values) =>
      api<{ message: string }>("/auth/reset-password", { method: "POST", body: { ...values, token } }),
  });

  if (!token) {
    return (
      <p className="text-center text-muted-foreground">
        This reset link is incomplete.{" "}
        <Link href="/forgot-password" className="font-medium text-foreground underline underline-offset-4">
          Request a new one
        </Link>
        .
      </p>
    );
  }

  if (reset.isSuccess) {
    return (
      <div className="rounded-xl bg-muted/60 p-6 text-center">
        <CircleCheck className="mx-auto size-8 text-success" />
        <p className="mt-3">{reset.data.message}</p>
        <Button nativeButton={false} render={<Link href="/login" />} className="mt-5 h-11 rounded-full px-6">
          Sign in
        </Button>
      </div>
    );
  }

  const { errors } = form.formState;

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => {
        setFormError(null);
        reset.mutate(values, { onError: (error) => setFormError(applyServerErrors(error, form.setError)) });
      })}
    >
      {formError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}
      <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...form.register("email")} />
      <FormField
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={errors.password?.message}
        {...form.register("password")}
      />
      <FormField
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.password_confirmation?.message}
        {...form.register("password_confirmation")}
      />
      <Button type="submit" disabled={reset.isPending} className="h-12 w-full rounded-full text-base">
        {reset.isPending ? "Saving…" : "Reset password"}
      </Button>
    </form>
  );
}
