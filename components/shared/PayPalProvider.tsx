"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PayPalProviderProps {
  children: React.ReactNode;
}

// Wrapper de PayPalScriptProvider para usar en el layout (Server Component)
// El client-id se pasa desde la variable de entorno pública
const PayPalProvider = ({ children }: PayPalProviderProps) => {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        currency: "USD",
        intent: "capture",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;
