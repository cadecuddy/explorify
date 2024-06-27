import Image from "next/image";
import { Inter } from "next/font/google";
import { useSession, signIn, signOut } from "next-auth/react";
import Loading from "@/components/Loading";
import Nav from "@/components/Nav";
import Playlists from "@/components/playlists/Playlists";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data, status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-background">
      <Nav session={data} />
      {data ? (
        <>
          <h1 className="text-center text-secondary">
            Welcome, {data.user?.name}!
          </h1>
          <Playlists />
        </>
      ) : (
        <h1 className="text-center text-secondary">sign in retard</h1>
      )}
    </main>
  );
}
