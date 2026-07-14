import "./globals.css";

export const metadata = {
  title: "false9 | Football T-Shirts",
  description: "Football streetwear from false9."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
