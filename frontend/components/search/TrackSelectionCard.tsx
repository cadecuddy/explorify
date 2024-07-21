import React from "react";
import { TrackSelection } from "./spotifyAPIUtil";
import { useSearchContext } from "./SearchContext";

interface TrackSelectionCardProps {
  track: TrackSelection;
}

const REMOVE_SVG = (
  <svg
    className="w-4 h-4 text-black"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function TrackSelectionCard({ track }: TrackSelectionCardProps) {
  const { tracksToSearch, setTracksToSearch } = useSearchContext();

  const handleTrackRemoval = (track: TrackSelection) => {
    setTracksToSearch(tracksToSearch.filter((t) => t.id !== track.id));
  };

  return (
    <div className="flex items-center border px-2 py-1">
      <p
        className="font-semibold text-black align-middle max-w-36 truncate"
        title={`${track.name} - ${track.artist}`}
      >
        {track.name}
      </p>
      <button
        type="button"
        onClick={() => handleTrackRemoval(track)}
        className="flex items-center justify-center mt-1 ml-1"
      >
        {REMOVE_SVG}
      </button>
    </div>
  );
}
