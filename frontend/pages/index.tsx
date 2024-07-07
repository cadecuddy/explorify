import { EB_Garamond } from "next/font/google";
import { useSession, signIn, signOut } from "next-auth/react";
import Loading from "@/components/Loading";
import Nav from "@/components/Nav";
import AuthedLanding from "@/components/AuthedLanding";

const inter = EB_Garamond({ subsets: ["latin"] });

export default function Home() {
  const { data, status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <main className={inter.className + " min-h-screen bg-background"}>
      <Nav session={data} />
      {data ? (
        <AuthedLanding />
      ) : (
        <h1 className="text-center text-secondary text-2xl">sign in retard</h1>
      )}
    </main>
  );
}
