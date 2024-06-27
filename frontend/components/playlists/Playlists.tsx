import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Loading from "../Loading";

export default function Playlists() {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);

  useEffect(() => {
    async function fetchPlaylists(url: string) {
      if (session && session.accessToken) {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        const data: SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified> =
          await response.json();
        setPlaylists((prev) => [...prev, ...data.items]);

        if (data.next) {
          fetchPlaylists(data.next);
        }
      }
    }

    if (session && session.accessToken) {
      fetchPlaylists(`https://api.spotify.com/v1/me/playlists?limit=50`);
    }
  }, [session]);

  return (
    <div className="max-w-4xl lg:max-w-7xl mx-auto p-4">
      {playlists.length === 0 && <Loading />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="flex flex-col items-center p-2 bg-gray-800 rounded-lg"
          >
            <img
              src={playlist.images[0].url}
              alt={playlist.name}
              className="rounded-lg w-full h-48 object-cover"
            />
            <h2 className="text-center text-white mt-2 w-full truncate">
              {playlist.name}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
