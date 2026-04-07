
export const metadata = {
  title: "Mom's Fresh Pot POS",
  description: "Advanced Restaurant Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
