import React from "react";
import { TrackSelection } from "./spotifyAPIUtil";

interface TrackSelectionCardProps {
  track: TrackSelection;
  handleTrackRemoval: (track: TrackSelection) => void;
}

export default function TrackSelectionCard({
  track,
  handleTrackRemoval,
}: TrackSelectionCardProps) {
  return (
    <div className="flex items-center border px-2 py-1">
      <p className="font-semibold text-black align-middle max-w-36 truncate">
        {track.name}
      </p>
      <button
        type="button"
        onClick={() => handleTrackRemoval(track)}
        className="flex items-center justify-center mt-1 ml-1"
      >
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
      </button>
    </div>
  );
}
