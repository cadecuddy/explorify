import { PlaylistSearchResult } from "@/components/search/spotifyAPIUtil";
import { GIN_WEB_SERVER_HOST } from "@/configuration/APIConstants";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

type RequestData = {
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
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).end(`Unauthorized`);

    const { tracks }: RequestData = req.body;

    // send tracks to gin server
    const playlistRequest = await fetch(
      `${GIN_WEB_SERVER_HOST}/playlists/tracks`,
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
