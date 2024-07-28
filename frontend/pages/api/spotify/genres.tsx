import { GIN_WEB_SERVER_HOST } from "@/configuration/APIConstants";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).end(`Unauthorized`);

    // Send playlists to gin server for processing
    const genreRequest = await fetch(`${GIN_WEB_SERVER_HOST}/genres/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const genres = await genreRequest.json();

    return res.status(200).json({ genres });
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
