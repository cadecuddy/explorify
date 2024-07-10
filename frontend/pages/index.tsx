import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import Nav from "@/components/Nav";
import { useRouter } from "next/router";

export default function Home() {
  const { data, status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }

  if (data) {
    const router = useRouter();
    router.push("/search");
  }

  return (
    <main className={"min-h-screen bg-background"}>
      <Nav session={data} />
      <h1 className="text-center text-secondary text-2xl">sign in man</h1>
    </main>
  );
}
