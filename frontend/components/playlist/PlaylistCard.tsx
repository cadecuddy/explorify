import Link from "next/link";
import Image from "next/image";
import { decodeHTMLEntities } from "../Utils";
import { PlaylistSearchResult } from "../search/spotifyAPIUtil";

export default function PlaylistCard({
  playlist,
}: {
  playlist: PlaylistSearchResult;
}) {
  return (
    <div
      key={playlist.id}
      className="relative bg-neutral-800 text-neutral-400 border-secondary overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:cursor-pointer hover:z-10 group"
    >
      <Link href={playlist.url} target="_blank">
        <Image
          src={playlist.image}
          alt={playlist.name}
          width={300}
          height={300}
          className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover opacity-25 transition duration-100 ease-in-out group-hover:opacity-50"
        />
        <div className="absolute top-0 left-0 right-0 p-4 text-lg sm:text-xl md:text-2xl group-hover:text-white">
          <h2 className="font-extrabold">
            {decodeHTMLEntities(playlist.name)}
          </h2>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-sm sm:text-base md:text-lg font-semibold group-hover:text-white">
          <p>{playlist.ownerName}</p>
          <p>
            {playlist.tracks.toLocaleString()} tracks{" "}
            <span className="text-xs">●</span>{" "}
            {playlist.followers.toLocaleString()} followers
          </p>
        </div>
      </Link>
    </div>
  );
}
