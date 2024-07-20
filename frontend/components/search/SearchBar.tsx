import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { fetchSpotifyTracks } from "./spotifyAPIUtil";
import { useSession } from "next-auth/react";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [songs, setSongs] = useState<String[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { data } = useSession();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    // if search is not empty, wait 3 seconds and check if query changed.
    // If it has, show the first 5 spotify track results based on the query
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (searchQuery.trim() !== "" && data !== null) {
      const id = setTimeout(async () => {
        const results: string[] = await fetchSpotifyTracks(searchQuery, data);
        setSongs(results);
      }, 2000);

      setTimeoutId(id);
    } else {
      setSongs([]);
    }

    // Clean up the timeout on component unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchQuery]);

  return (
    <>
      <div className="flex w-full items-center space-x-2 mt-2">
        <Input
          type="text"
          placeholder="Search for songs..."
          onChange={handleInputChange}
          value={searchQuery}
        />
      </div>
      {songs.length > 0 && (
        <ul className="mt-2 text-white">
          {songs.slice(0, 5).map((song, index) => (
            <li key={index} className="text-black dark:text-white">
              {song}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
