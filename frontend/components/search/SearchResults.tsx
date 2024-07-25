import Image from "next/image";
import { decodeHTMLEntities } from "../Utils";
import { useSearchContext } from "./SearchContext";
import PlaylistCard from "../playlist/PlaylistCard";

/**
 * Showcases the playlists that turn up as a result of the user's query.
 */
export default function SearchResults() {
  const { playlistResults } = useSearchContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-6">
      {playlistResults &&
        playlistResults.length > 0 &&
        playlistResults.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
    </div>
  );
}
