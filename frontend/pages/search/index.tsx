import AuthedLanding from "@/components/AuthedLanding";
import Loading from "@/components/Loading";
import Nav from "@/components/Nav";
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
    <main className="min-h-screen bg-background">
      <Nav session={data} />
      <AuthedLanding />
    </main>
  );
}
