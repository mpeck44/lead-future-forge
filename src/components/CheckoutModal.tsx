import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StripeEmbeddedCheckoutView } from "@/components/StripeEmbeddedCheckout";
import { COMPLETE_PATH } from "@/lib/bundles";

export type CheckoutTarget =
  | { mode: "bundle" }
  | { mode: "course"; courseId: string; courseTitle: string };

interface Props {
  target: CheckoutTarget | null;
  onClose: () => void;
}

export function CheckoutModal({ target, onClose }: Props) {
  if (!target) return null;
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center overflow-y-auto p-4 pt-10"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-background rounded-lg max-w-3xl w-full shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="font-display text-lg font-semibold">
              {target.mode === "bundle"
                ? "Buy the Complete Path"
                : `Buy ${target.courseTitle}`}
            </div>
            <div className="font-body text-sm text-muted-foreground">
              Secure checkout powered by Stripe
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close checkout"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">
          <StripeEmbeddedCheckoutView
            {...(target.mode === "bundle"
              ? { bundleKey: COMPLETE_PATH.key }
              : { courseId: target.courseId })}
            returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
          />
        </div>
      </div>
    </div>
  );
}
