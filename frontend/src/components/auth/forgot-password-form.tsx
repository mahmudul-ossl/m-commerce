"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/form-errors";

const schema = z.object({ email: z.email("Enter a valid email address.") });
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const send = useMutation({
    mutationFn: (values: Values) => api<{ message: string }>("/auth/forgot-password", { method: "POST", body: values }),
  });

  if (send.isSuccess) {
    return (
      <div className="rounded-xl bg-muted/60 p-6 text-center">
        <MailCheck className="mx-auto size-8 text-brand" />
        <p className="mt-3">{send.data.message}</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => {
        setFormError(null);
        send.mutate(values, { onError: (error) => setFormError(applyServerErrors(error, form.setError)) });
      })}
    >
      {formError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />
      <Button type="submit" disabled={send.isPending} className="h-12 w-full rounded-full text-base">
        {send.isPending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-muted-foreground underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
