import { cn } from "@/lib/utils";
import React from "react";
import TrackSelectionCard from "../search/TrackSelectionCard";
import { useSearchContext } from "../search/SearchContext";
import { useSession } from "next-auth/react";
import { PlaylistSearchResult } from "../search/spotifyAPIUtil";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchFunction?: () => void;
}

const SEARCH_SVG = (
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
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, searchFunction, onChange, ...props }, ref) => {
    const { tracksToSearch, setPlaylistResults } = useSearchContext();
    const { data } = useSession();

    return (
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 flex items-center pointer-events-none top-1/2 transform -translate-y-1/2 text-black">
          {SEARCH_SVG}
        </div>
        <input
          type={type}
          value={value}
          autoFocus
          onChange={onChange}
          className={cn(
            "px-10 flex h-14 w-full rounded-md bg-gray-100 ring-offset-0 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 font-normal text-base",
            className
          )}
          ref={ref}
          {...props}
        />
        {tracksToSearch.length > 0 && (
          <div className="flex items-center space-x-2 absolute right-2 top-1/2 transform -translate-y-1/2 pr-16">
            {tracksToSearch.map((track) => (
              <TrackSelectionCard key={track.id} track={track} />
            ))}
          </div>
        )}
        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white p-4 -mr-1 rounded-md"
          onClick={searchFunction}
        >
          {SEARCH_SVG}
        </button>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
