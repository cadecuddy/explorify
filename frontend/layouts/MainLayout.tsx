import Footer from "@/components/Footer";
import MetaHeader from "@/components/MetaHeader";
import { ReactNode } from "react";

type MainLayoutProps = {
  children: ReactNode;
  description: string;
  title: string;
};

export default function MainLayout({
  children,
  description,
  title,
}: MainLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      <MetaHeader title={title} description={description} />
      {children}
      {/* <Footer /> */}
    </main>
  );
}
