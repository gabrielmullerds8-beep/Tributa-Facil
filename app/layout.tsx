import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tributa Fácil",
  description: "Consulta fiscal assistida para NCM, ICMS, PIS/COFINS, CFEM, IPI, CFOP e CST.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
