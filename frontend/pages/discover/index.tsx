import Loading from "@/components/Loading";
import MainLayout from "@/layouts/MainLayout";
import PlaylistProcessorWrapper from "@/layouts/PlaylistProcessorWrapper";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Search() {
  const [genres, setGenres] = useState<string[]>([]);
  const { status, data: session } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/spotify/genres", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      }).then(async (res) => {
        const data = await res.json();
        setGenres(data.genres.genres);
      });
    }
  }, [status]);

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <MainLayout
      description="Find your next favorite playlist based on songs you love"
      title="search / explorify"
    >
      <PlaylistProcessorWrapper>
        <div className="justify-center text-center">
          <h1 className="text-3xl sm:text-5xl font-semibold p-2 text-neutral-50">
            Browse Playlists
          </h1>
          <h2 className="text-lg sm:text-2xl font-normal text-neutral-400">
            Explore thousands of playlists by genre.
          </h2>
        </div>
        <div className="flex justify-center">
          <div className="text-white py-12">
            {genres.length > 0 &&
              genres.map((genre) => (
                <Link
                  href={`/discover/${genre.replaceAll(" ", "_")}`}
                  key={genre}
                  className="block text-left text-7xl w-fit font-bold text-gray-500 hover:text-white"
                >
                  {genre}
                </Link>
              ))}
          </div>
        </div>
      </PlaylistProcessorWrapper>
    </MainLayout>
  );
}
