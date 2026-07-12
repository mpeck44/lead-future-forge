import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  courseId: string;
  returnUrl: string;
}

export function StripeEmbeddedCheckoutView({ courseId, returnUrl }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { courseId, returnUrl, environment: getStripeEnvironment() },
    });
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
