import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { fetchSpotifyTracks, TrackSelection } from "./spotifyAPIUtil";
import { useSession } from "next-auth/react";

/**
 * Component for adding songs to search query. Displays track track
 * selection suggestions and creates & maintains track search context.
 */
export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTracks, setSelectedTracks] = useState<TrackSelection[]>([]);
  const [suggestedTracks, setSuggestedTracks] = useState<TrackSelection[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { data } = useSession();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTrackSelection = (track: TrackSelection) => {
    setSelectedTracks([...selectedTracks, track]);
    setSearchQuery("");
  };

  const handleTrackRemoval = (track: TrackSelection) => {
    setSelectedTracks(selectedTracks.filter((t) => t.id !== track.id));
  };

  // Suggest songs based on current query after user stops typing after 1 second
  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (searchQuery.trim() !== "" && data !== null) {
      const id = setTimeout(async () => {
        const results = await fetchSpotifyTracks(searchQuery, data);
        setSuggestedTracks(results);
      }, 1000);

      setTimeoutId(id);
    } else {
      setSuggestedTracks([]);
    }

    // cleanup timeout, just to be safe
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
          selectedTracks={selectedTracks}
          handleTrackRemoval={handleTrackRemoval}
        />
      </div>
      {suggestedTracks.length > 0 && (
        <div className="mt-4">
          <ul className="space-y-2">
            {suggestedTracks.map((track) => (
              <li
                key={track.id}
                className="flex items-center space-x-2 hover:cursor-pointer"
                onClick={() => handleTrackSelection(track)}
              >
                <img
                  src={track.picture}
                  alt="track"
                  className="w-12 h-12 rounded-sm"
                />
                <div>
                  <p className="font-semibold text-white">{track.name}</p>
                  <p className="text-md text-neutral-400">
                    {track.artist.join(", ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
