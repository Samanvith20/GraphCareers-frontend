import { useRef, useState } from "react";
import { toast } from "sonner";

export const useRazorpayPayment = () => {
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const idempotencyKeyRef = useRef(null);

  const startPayment = async () => {
    try {
      setLoading(true);

      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = crypto.randomUUID();
      }

      const res = await fetch(`${BASE_URL}/api/payments/create-order`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        toast.info(data.message || "Something went wrong");
        idempotencyKeyRef.current = null;
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "GraphCareers",
        description: "Pro Plan",
        order_id: data.orderId,

        handler: async function (response) {
          const toastId = toast.loading("Verifying payment...");

          try {
            const verifyRes = await fetch(`${BASE_URL}/api/payments/verify`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              toast.error("Verification failed", { id: toastId });
              return;
            }

            toast.success("Payment successful 🎉", { id: toastId });

            idempotencyKeyRef.current = null;
          } catch (err) {
            console.error(err);
            toast.error("Something went wrong", { id: toastId });
          }
        },

        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
            //console.log("Payment popup closed");
          },
        },

        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return { startPayment, loading };
};
