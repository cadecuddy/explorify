import Image from "next/image";
import { decodeHTMLEntities } from "../Utils";
import { useSearchContext } from "./SearchContext";

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
          <div
            key={playlist.id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative w-full h-48">
              <Image
                src={playlist.image}
                alt="playlist cover"
                layout="fill"
                objectFit="cover"
                className="w-full h-full"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white truncate">
                {playlist.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                by{" "}
                <a
                  href={playlist.ownerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {playlist.ownerName}
                </a>
              </p>
              <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                {decodeHTMLEntities(playlist.description)}
              </p>
              <div className="mt-4">
                <a
                  href={playlist.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-500 underline"
                >
                  View Playlist
                </a>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
