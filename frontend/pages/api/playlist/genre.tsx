import { PlaylistSearchResult } from "@/components/search/spotifyAPIUtil";
import { GIN_WEB_SERVER_HOST } from "@/configuration/APIConstants";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

type RequestData = {
  session: Session;
  tracks: string[]; // track ids
};

type ResponseData = {
  playlists: PlaylistSearchResult[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).end(`Unauthorized`);
    const { genre } = req.query;

    // send tracks to gin server
    const playlistRequest = await fetch(
      `${GIN_WEB_SERVER_HOST}/playlists/genre?genre=${genre}`,
      {
        method: "GET",
      }
    );

    const playlists = await playlistRequest.json();

    return res.status(200).json({ playlists });
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
