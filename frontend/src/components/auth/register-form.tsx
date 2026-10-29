"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { useRegister } from "@/hooks/use-auth";
import { applyServerErrors, safeRedirect } from "@/lib/form-errors";

const schema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(255),
    email: z.email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .max(20)
      .refine((value) => value === "" || /^[0-9+\-\s]{6,20}$/.test(value), "Enter a valid phone number."),
    password: z.string().min(8, "Use at least 8 characters."),
    password_confirmation: z.string(),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords don't match.",
  });

type Values = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = useRegister();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", password_confirmation: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    register.mutate(
      { ...values, phone: values.phone || undefined },
      {
        onSuccess: ({ data }) => {
          toast.success(`Welcome, ${data.name.split(" ")[0]}! Your account is ready.`);
          router.replace(safeRedirect(searchParams.get("redirect")));
        },
        onError: (error) => setFormError(applyServerErrors(error, form.setError)),
      },
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}

      <FormField label="Full name" autoComplete="name" error={errors.name?.message} {...form.register("name")} />
      <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...form.register("email")} />
      <FormField
        label="Phone (optional)"
        type="tel"
        autoComplete="tel"
        hint="Used by the delivery rider to reach you."
        error={errors.phone?.message}
        {...form.register("phone")}
      />
      <FormField
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={errors.password?.message}
        {...form.register("password")}
      />
      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.password_confirmation?.message}
        {...form.register("password_confirmation")}
      />

      <Button type="submit" disabled={register.isPending} className="h-12 w-full rounded-full text-base">
        {register.isPending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
