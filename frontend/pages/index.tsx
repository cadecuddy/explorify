import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import Nav from "@/components/Nav";
import { useRouter } from "next/router";
import MainLayout from "@/layouts/MainLayout";

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
    <MainLayout
      description="Find your next favorite playlist based on songs you love"
      title="home / explorify"
    >
      <div className="max-w-7xl mx-auto">
        <Nav session={data} />
      </div>
    </MainLayout>
  );
}
