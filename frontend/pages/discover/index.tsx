import Loading from "@/components/Loading";
import MainLayout from "@/layouts/MainLayout";
import PlaylistProcessorWrapper from "@/layouts/PlaylistProcessorWrapper";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Search() {
  const [genres, setGenres] = useState<string[]>([]);
  const [displayedGenres, setDisplayedGenres] = useState<string[]>([]);
  const [query, setQuery] = useState<string>("");
  const { status, data: session } = useSession();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    if (query === "") {
      setDisplayedGenres(genres);
    } else {
      setDisplayedGenres(
        genres.filter((genre) =>
          genre.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }, [query, genres]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/spotify/genres", {
        headers: {
          "Content-Type": "application/json",
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
      description="Explore thousands of playlists by genre"
      title="discover / explorify"
    >
      <PlaylistProcessorWrapper>
        <div className="justify-center text-center">
          <h1 className="text-3xl sm:text-5xl font-semibold p-2 text-neutral-50">
            Discover New Music
          </h1>
          <h2 className="text-lg sm:text-2xl font-normal text-neutral-400">
            Explore thousands of playlists by genre.
          </h2>
        </div>
        <div className="flex sm:justify-center sm:mr-0 mt-4 -mb-2">
          <input
            type="text"
            value={query}
            onChange={onInputChange}
            autoFocus
            placeholder="explore..."
            className="w-1/2 p-2 block bg-transparent outline-none text-white text-5xl font-bold border-b-2 border-gray-500 ml-12 sm:ml-0 placeholder:text-gray-500"
          />
        </div>
        <div className="flex justify-start sm:ml-48">
          <div className="text-white py-12">
            {genres &&
              genres.length > 0 &&
              displayedGenres.map((genre) => (
                <Link
                  href={`/discover/${genre.replaceAll(" ", "_")}`}
                  key={genre}
                  className="block text-4xl ml-12 sm:ml-0 sm:text-7xl w-fit font-bold text-gray-500 hover:text-white"
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
