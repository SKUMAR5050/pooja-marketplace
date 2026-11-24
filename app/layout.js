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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
          <footer className="mt-10">
            <div className="garland" />
            <div className="bg-maroon-dark px-4 py-8 text-center text-amber-100">
              <div className="font-serif text-lg text-gold">ॐ सर्वे भवन्तु सुखिनः</div>
              <div className="mt-1 text-sm">
                Pooja Bazaar: connecting you with trusted local pooja shops 🙏
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
