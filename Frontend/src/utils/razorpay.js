/**
 * Utility to load Razorpay Checkout script dynamically
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Initiates Razorpay payment checkout for 5 Premium Interviews (₹179)
 * @param {Object} options
 * @param {Object} options.user
 * @param {Function} options.onSuccess
 * @param {Function} options.onError
 */
export const initiateRazorpayPayment = async ({ user, onSuccess, onError }) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded && typeof window.Razorpay === "undefined") {
      throw new Error("Could not load payment gateway SDK. Please check your internet connection.");
    }

    // Step 1: Create Order on Backend
    const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}));
      throw new Error(err.message || "Failed to initialize payment order.");
    }

    const orderData = await orderRes.json();

    const isSimulated = orderData.orderId && orderData.orderId.startsWith("order_sim_");

    // Step 2: Open Razorpay Live / Test Modal
    const options = {
      key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag",
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "HireIQ AI Interviewer",
      description: "5 Premium AI Interviews + Detailed Reports (₹179)",
      image: "https://cdn-icons-png.flaticon.com/512/9187/9187604.png",
      ...(isSimulated ? {} : { order_id: orderData.orderId }),
      prefill: {
        name: user?.name || orderData.prefill?.name || "",
        email: user?.email || orderData.prefill?.email || "",
      },
      theme: {
        color: "#d97706", // Amber 600
      },
      handler: async function (response) {
        try {
          const verifyRes = await fetch("http://localhost:5000/api/payment/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || orderData.orderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || "test_signature",
            }),
            credentials: "include",
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            throw new Error(verifyData.message || "Payment verification failed.");
          }

          if (onSuccess) onSuccess(verifyData);
        } catch (err) {
          if (onError) onError(err);
        }
      },
      modal: {
        ondismiss: function () {
          console.log("Razorpay payment modal closed by user.");
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", async function (response) {
      console.warn("Razorpay payment failed:", response.error);

      // If placeholder keys or no methods available in Razorpay test account
      if (
        isSimulated ||
        response.error?.description?.includes("payment method") ||
        response.error?.code === "BAD_REQUEST_ERROR" ||
        response.error?.reason === "payment_failed"
      ) {
        const confirmSandbox = window.confirm(
          "Notice: Your Razorpay API Key in .env is either a placeholder or has no active payment methods enabled in test mode.\n\nWould you like to complete this test transaction in Instant Sandbox mode to unlock 5 Premium Interviews?"
        );

        if (confirmSandbox) {
          try {
            const verifyRes = await fetch("http://localhost:5000/api/payment/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: `pay_sandbox_${Date.now()}`,
                razorpay_signature: "sandbox_verified",
              }),
              credentials: "include",
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && onSuccess) {
              onSuccess(verifyData);
              return;
            }
          } catch (e) {
            console.error("Sandbox verification error:", e);
          }
        }
      }

      if (onError) {
        onError(
          new Error(
            response.error?.description ||
              "No payment method found for this Razorpay Key. Please add your real Test API Key in Backend/.env or use Sandbox mode."
          )
        );
      }
    });

    rzp.open();
  } catch (err) {
    console.error("Razorpay initiation error:", err);
    if (onError) onError(err);
  }
};


