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
    <main className="min-h-screen">
      <MetaHeader title={title} description={description} />
      <div className="relative min-h-screen w-full bg-slate-950">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)]">
          {children}
        </div>
      </div>
      {/* <Footer /> */}
    </main>
  );
}
