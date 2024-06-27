import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Loading from "../Loading";

export default function Playlists() {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState<SpotifyApi.PlaylistBaseObject[]>(
    []
  );
  const [fetchingComplete, setFetchingComplete] = useState<Boolean>(false);

  useEffect(() => {
    if (session && session.accessToken) {
      fetchPlaylists(`https://api.spotify.com/v1/me/playlists?limit=50`);
    }
  }, []);

  useEffect(() => {
    if (fetchingComplete) {
      processPlaylists(playlists);
    }
  }, [fetchingComplete]);

  const fetchPlaylists = async (url: string) => {
    if (!session || !session.accessToken) return;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      const data: SpotifyApi.PagingObject<SpotifyApi.PlaylistBaseObject> =
        await response.json();
      setPlaylists((prev) => [...prev, ...data.items]);

      if (data.next) {
        fetchPlaylists(data.next);
      } else {
        setFetchingComplete(true);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setFetchingComplete(true);
    }
  };

  const processPlaylists = async (
    playlists: SpotifyApi.PlaylistBaseObject[]
  ) => {
    const publicPlaylists = playlists
      .filter((playlist) => playlist.public)
      .map((playlist) => playlist.id);

    try {
      const response = await fetch("/api/playlist/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicPlaylists,
        }),
      });
    } catch (error) {
      console.error("Error processing playlists:", error);
    }
  };

  const decodeHTMLEntities = (text: string | undefined) => {
    if (!text) return "";
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
  };

  return (
    <div className="max-w-4xl lg:max-w-7xl mx-auto p-4">
      {playlists.length === 0 && <Loading />}
      <h2 className="text-center text-white text-2xl mt-4">
        {playlists.length} Playlists
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="flex flex-col items-center p-4 bg-gray-800 rounded-lg overflow-hidden shadow-lg text-left"
          >
            {playlist.images && playlist.images[0] ? (
              <img
                src={playlist.images[0].url}
                alt={playlist.name}
                className="rounded-lg w-full h-48 object-cover"
              />
            ) : (
              <div className="rounded-lg w-full h-48 flex items-center justify-center bg-gray-700 text-gray-400">
                No Image
              </div>
            )}
            <h2 className="text-center text-white mt-2 w-full truncate">
              {playlist.name}
            </h2>
            <p className="text-center text-gray-400 mt-1 text-sm h-28 overflow-scroll overflow-ellipsis">
              {decodeHTMLEntities(
                playlist.description?.replace(/<[^>]*>/g, "")
              ) || "No description available"}
            </p>
            <p className="text-center text-gray-500 mt-1 text-xs">
              By {playlist.owner.display_name}
            </p>
            <a
              href={playlist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-blue-500 mt-2 text-sm"
            >
              Open in Spotify
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
