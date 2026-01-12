import "../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AI Image Studio",
  description: "AI Image Studio MVP"
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
