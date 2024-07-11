import AuthedLanding from "@/components/AuthedLanding";
import Loading from "@/components/Loading";
import Nav from "@/components/Nav";
import MainLayout from "@/layouts/MainLayout";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Search() {
  const { data, status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }

  if (!data) {
    redirect("/");
  }

  return (
    <MainLayout description="haha" title="home / explorify">
      <div className="max-w-7xl mx-auto">
        <Nav session={data} />
        <AuthedLanding />
      </div>
    </MainLayout>
  );
}
