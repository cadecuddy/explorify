import { fetchPublicPlaylists } from "@/components/playlist/PlaylistLoader";
import { GIN_WEB_SERVER_HOST } from "@/configuration/APIConstants";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { getAccessToken } from "../util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // get auth token from auth bearer header
    const accessToken = getAccessToken(req);

    if (!accessToken) return res.status(401).end(`Unauthorized`);

    // Send playlists to gin server for processing
    const genreRequest = await fetch(`${GIN_WEB_SERVER_HOST}/genres/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const genres = await genreRequest.json();

    return res.status(200).json({ genres });
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
