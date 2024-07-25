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
      className="relative bg-neutral-800 border-2 border-secondary rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:cursor-pointer"
    >
      <Link href={playlist.url} target="_blank">
        <Image
          src={playlist.image}
          alt={playlist.name}
          width={300}
          height={300}
          className="h-[350px] w-[350px] object-cover opacity-30 transition duration-100 ease-in-out hover:opacity-50"
        />
        <div className="absolute top-0 left-0 right-0 w-64 p-4 text-3xl">
          <h2 className="text-white font-extrabold">
            {decodeHTMLEntities(playlist.name)}
          </h2>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-4">
          <p className="text-white text-sm font-semibold">
            {playlist.ownerName}
          </p>
          <p className="text-white text-base font-semibold">
            {playlist.tracks.toLocaleString()} tracks{" "}
            <span className="text-xs">●</span>{" "}
            {playlist.followers.toLocaleString()} followers
          </p>
        </div>
      </Link>
    </div>
  );
}
