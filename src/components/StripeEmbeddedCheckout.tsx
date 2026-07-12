import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  courseId?: string;
  bundleKey?: string;
  returnUrl: string;
}

export function StripeEmbeddedCheckoutView({ courseId, bundleKey, returnUrl }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const body: Record<string, unknown> = {
      returnUrl,
      environment: getStripeEnvironment(),
    };
    if (bundleKey) body.bundleKey = bundleKey;
    else body.courseId = courseId;

    const { data, error } = await supabase.functions.invoke("create-checkout", { body });
    if (error || !data?.clientSecret) {
      const msg = data?.error || error?.message || "Failed to start checkout";
      throw new Error(msg);
    }
    return data.clientSecret as string;
  };

  return (
    <div id="checkout" className="min-h-[600px]">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
