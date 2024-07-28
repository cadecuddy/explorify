import { PlaylistSearchResult } from "@/components/search/spotifyAPIUtil";
import MainLayout from "@/layouts/MainLayout";
import PlaylistProcessorWrapper from "@/layouts/PlaylistProcessorWrapper";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PlaylistCard from "@/components/playlist/PlaylistCard";

export default function Page() {
  const [playlistResults, setPlaylistResults] = useState<
    PlaylistSearchResult[]
  >([]);
  const router = useRouter();
  const genre = router.query.genre as string;

  useEffect(() => {
    if (genre) {
      fetch(`/api/playlist/genre?genre=${genre.replaceAll("_", " ")}`)
        .then((response) => response.json())
        .then((data) => {
          setPlaylistResults(data.playlists.playlists);
        });
    }
  }, [genre]);

  return (
    <MainLayout
      description={`Playlists in the ${toTitleCase(
        genre
      )} genre. Discover new music and spotify playlists on explorify.`}
      title={`${toTitleCase(genre)} / explorify`}
    >
      <PlaylistProcessorWrapper>
        <div className="justify-center text-center">
          <h1 className="text-3xl sm:text-7xl font-extrabold p-2 text-white">
            {toTitleCase(genre)}
          </h1>
          {playlistResults.length > 0 ? (
            <h2 className="text-lg sm:text-2xl font-normal text-neutral-400 pt-2">
              {playlistResults.length.toLocaleString()}{" "}
              {playlistResults.length === 1 ? "playlist" : "playlists"} found
            </h2>
          ) : (
            <h2 className="text-lg sm:text-2xl font-normal text-neutral-400 pt-2">
              No playlists found
            </h2>
          )}
        </div>
        <hr className="mt-4 mb-4 border-neutral-700" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 py-6">
          {playlistResults &&
            playlistResults.length > 0 &&
            playlistResults.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
        </div>
      </PlaylistProcessorWrapper>
    </MainLayout>
  );
}

function toTitleCase(str: string) {
  if (!str) return "";
  return str.replaceAll("_", " ");
}
