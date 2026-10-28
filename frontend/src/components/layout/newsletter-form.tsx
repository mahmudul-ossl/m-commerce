"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  return (
    <form
      className="flex max-w-sm gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        // TODO: connect to a newsletter endpoint once one exists.
        toast.info("Newsletter sign-up is opening soon. Thanks for your interest!");
        event.currentTarget.reset();
      }}
    >
      <Input
        type="email"
        required
        name="email"
        placeholder="Your email address"
        aria-label="Email address"
        className="h-10 bg-background"
      />
      <Button type="submit" size="icon-lg" className="size-10" aria-label="Subscribe">
        <ArrowRight />
      </Button>
    </form>
  );
}
