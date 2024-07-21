import { PlaylistSearchResult } from "@/components/search/spotifyAPIUtil";
import { GIN_WEB_SERVER_HOST } from "@/configuration/APIConstants";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";

type RequestData = {
  session: Session;
  tracks: string[]; // track ids
};

// type ResponseData = {
//   playlists: SpotifyApi.PlaylistObjectFull;
// };

type ResponseData = {
  playlists: PlaylistSearchResult[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const { session, tracks }: RequestData = req.body;

    if (!session) return res.status(401).end(`Unauthorized`);

    // send tracks to gin server
    const playlistRequest = await fetch(
      `${GIN_WEB_SERVER_HOST}/playlists/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: session.accessToken,
          tracks,
        }),
      }
    );

    const playlists = await playlistRequest.json();

    return res.status(200).json({ playlists });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}