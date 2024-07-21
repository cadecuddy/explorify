import { cn } from "@/lib/utils";
import { TrackSelection } from "../search/spotifyAPIUtil";
import React from "react";
import TrackSelectionCard from "../search/TrackSelectionCard";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedTracks: TrackSelection[];
  handleTrackRemoval: (track: TrackSelection) => void;
}

const SEARCH_SVG = (
  <svg
    className="w-5 h-5 text-black"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 4.5a7.5 7.5 0 010 12.15z"
    />
  </svg>
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, selectedTracks, onChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 flex items-center pointer-events-none top-1/2 transform -translate-y-1/2">
          {SEARCH_SVG}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={cn(
            "px-10 flex h-14 w-full rounded-md bg-gray-100 ring-offset-0 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 font-normal text-base",
            className
          )}
          ref={ref}
          {...props}
        />
        {selectedTracks.length > 0 && (
          <div className="flex items-center space-x-2 absolute right-2 top-1/2 transform -translate-y-1/2 pr-16">
            {selectedTracks.map((track) => (
              <TrackSelectionCard
                key={track.id}
                track={track}
                handleTrackRemoval={props.handleTrackRemoval}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white p-4 -mr-1 rounded-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 4.5a7.5 7.5 0 010 12.15z"
            />
          </svg>
        </button>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
