import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

const emailSchema = z.string().trim().email("Please enter a valid email address").max(255);

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
}

const WaitlistModal = ({ open, onOpenChange, source = "hero" }: WaitlistModalProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    const { error: dbError } = await supabase
      .from("waitlist_leads")
      .insert({ email: result.data, source });

    setIsSubmitting(false);

    if (dbError) {
      if (dbError.code === "23505") {
        setError("You're already on the waitlist!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }

    setIsSuccess(true);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state on close
      setTimeout(() => {
        setEmail("");
        setError("");
        setIsSuccess(false);
      }, 200);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                You're on the list!
              </h3>
              <p className="font-body text-muted-foreground text-sm max-w-xs mx-auto">
                We'll let you know when The Leadership Forge opens enrollment. Check your inbox soon.
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Got it
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Join the Waitlist
              </DialogTitle>
              <DialogDescription className="font-body">
                Be the first to know when new pathways open. No spam—just launch updates.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@district.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className="pl-10"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive mt-1.5 font-body">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full font-body font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join the Waitlist"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center font-body">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
