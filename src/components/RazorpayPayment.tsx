// components/RazorpayPayment.tsx

import React, { useEffect, useRef } from "react";

export interface RazorpayPaymentProps {
  orderId: string;
  amount: number; // in paise
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  email: string;
  contact: string;
  onSuccess: (response: any) => void;
  onFailure?: (response: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  orderId,
  amount,
  currency = "INR",
  name,
  description = "",
  image,
  email,
  contact,
  onSuccess,
  onFailure,
}) => {
  const hasOpened = useRef(false);

  const loadRazorpay = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => openCheckout();
    script.onerror = () => {
      console.error("Failed to load Razorpay");
      if (onFailure) onFailure({ status: "error", message: "Failed to load Razorpay" });
    };
    document.body.appendChild(script);
  };

  const openCheckout = () => {
    if (hasOpened.current) return;
    hasOpened.current = true;

    const options = {
      key: "rzp_test_RQSSkW8Jr7P8pL", // Replace with your Razorpay Key ID
      amount,
      currency,
      name,
      description,
      image,
      order_id: orderId,
      handler: (response: any) => {
        console.log("Razorpay payment success:", response);
        onSuccess(response);
      },
      prefill: {
        name,
        email,
        contact,
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        ondismiss: () => {
          console.log("Payment modal dismissed");
          hasOpened.current = false;
          if (onFailure) onFailure({ status: "cancelled" });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    if (orderId && !hasOpened.current) {
      loadRazorpay();
    }
  }, [orderId]);

  return null;
};

// import React, { useEffect, useRef } from "react";

// export interface RazorpayPaymentProps {
//   orderId: string;
//   amount: number;
//   currency?: string;
//   name: string;
//   description?: string;
//   image?: string;
//   email: string;
//   contact: string;
//   onSuccess: (response: any) => void;
//   onFailure?: (response: any) => void;
// }

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// export const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
//   orderId,
//   amount,
//   currency = "INR",
//   name,
//   description = "",
//   image,
//   email,
//   contact,
//   onSuccess,
//   onFailure,
// }) => {
//   const hasOpened = useRef(false); // 🔥 prevents multiple popups

//   const loadRazorpay = () => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     script.onload = () => openCheckout();
//     document.body.appendChild(script);
//   };

//   const openCheckout = () => {
//     if (hasOpened.current) return; // 🔥 Do NOT open again

//     hasOpened.current = true;

//     const options = {
//       key: "rzp_test_RQSSkW8Jr7P8pL",
//       amount,
//       currency,
//       name,
//       description,
//       image,
//       order_id: orderId,
//       handler: onSuccess,
//       prefill: { name, email, contact },
//       notes: { address: "Razorpay Corporate Office" },
//       theme: { color: "#3399cc" },
//       modal: {
//         ondismiss: () => {
//           hasOpened.current = false; // allow reopening later if needed
//           if (onFailure) onFailure({ status: "cancelled" });
//         },
//       },
//       redirect: false,
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   };

//   useEffect(() => {
//     if (orderId && !hasOpened.current) {
//       loadRazorpay();
//     }
//   }, [orderId]);

//   return null;
// };
