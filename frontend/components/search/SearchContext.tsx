import React, { createContext, useContext, useState, ReactNode } from "react";
import { PlaylistSearchResult, TrackSelection } from "./spotifyAPIUtil";

// context for managing search results
interface SearchContextType {
  tracksToSearch: TrackSelection[];
  setTracksToSearch: (tracks: TrackSelection[]) => void;
  playlistResults: PlaylistSearchResult[];
  setPlaylistResults: (results: PlaylistSearchResult[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// returns the context if called within the provider
export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [tracksToSearch, setTracksToSearch] = useState<TrackSelection[]>([]);
  const [playlistResults, setPlaylistResults] = useState<
    PlaylistSearchResult[]
  >([]);

  return (
    <SearchContext.Provider
      value={{
        tracksToSearch,
        setTracksToSearch,
        playlistResults,
        setPlaylistResults,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
