import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import {
  fetchSpotifyTracks,
  PlaylistSearchResult,
  TrackSelection,
} from "./spotifyAPIUtil";
import { useSession } from "next-auth/react";
import { useSearchContext } from "./SearchContext";

/**
 * Component for adding songs to search query. Displays track track
 * selection suggestions and creates & maintains track search context.
 */
export default function SearchBar() {
  // local state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestedTracks, setSuggestedTracks] = useState<TrackSelection[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // global hooks and shit
  const { data } = useSession();
  const { tracksToSearch, setTracksToSearch, setPlaylistResults } =
    useSearchContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // handle user clicking on track, adding it to their search
  const handleTrackSelection = (track: TrackSelection) => {
    // ensure not duplicate
    if (
      tracksToSearch
        .map((existingTrack) => existingTrack.id)
        .indexOf(track.id) != -1
    ) {
      return;
    }

    setTracksToSearch([...tracksToSearch, track]);
    setSearchQuery("");
  };

  // monitor for enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tracksToSearch.length > 0) {
      doPlaylistSearch();
    }
  };

  async function doPlaylistSearch() {
    if (data && data.accessToken && tracksToSearch.length > 0) {
      const playlistSearchResponse = await fetch("/api/playlist/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: data,
          tracks: tracksToSearch.map((track) => track.id),
        }),
      });

      if (playlistSearchResponse.status == 200) {
        const responseJson = await playlistSearchResponse.json();

        const playlistSearchResults: PlaylistSearchResult[] =
          responseJson.playlists.playlists;

        setPlaylistResults(playlistSearchResults);
      }
    }
  }

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
          searchFunction={doPlaylistSearch}
          onKeyDown={handleKeyPress}
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
