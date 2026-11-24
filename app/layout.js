import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";

export const metadata = {
  title: "Pooja Bazaar – Pooja items from local shops",
  description:
    "Order agarbatti, flowers, coconut, diyas and puja samagri from trusted local pooja shops near you. Pickup or free delivery above ₹500.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-gray-500">
            Pooja Bazaar – connecting you with local pooja shops 🙏
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
