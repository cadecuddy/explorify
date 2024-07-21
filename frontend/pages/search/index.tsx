import Loading from "@/components/Loading";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import MainLayout from "@/layouts/MainLayout";
import PlaylistProcessorWrapper from "@/layouts/PlaylistProcessorWrapper";
import { useSession } from "next-auth/react";

export default function Search() {
  const { status } = useSession();

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
            Discover New Music
          </h1>
          <h2 className="text-lg sm:text-2xl font-normal text-neutral-400">
            Search songs, discover playlists, explore new music.
          </h2>
        </div>

        <div className="mt-4 p-2">
          <SearchBar />
          <SearchResults />
        </div>
        <hr className="mt-8 mb-8 border-neutral-700" />
      </PlaylistProcessorWrapper>
    </MainLayout>
  );
}
