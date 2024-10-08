import { fetchUserPlaylists } from "@/components/playlist/PlaylistLoader";
import { GIN_WEB_SERVER_HOST } from "@/configuration/APIConstants";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

type ResponseData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).end(`Unauthorized`);

    // get all of the user's public playlists from Spotify
    const publicPlaylists = await fetchUserPlaylists(session.accessToken);

    if (!publicPlaylists) {
      res.status(500).json({ message: "Error fetching playlists" });
      return;
    }

    const playlistIds = publicPlaylists.filter((playlist) => playlist.id);

    // Send playlists to gin server for processing
    const processRequest = await fetch(
      `${GIN_WEB_SERVER_HOST}/playlists/process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: session.accessToken,
          playlists: playlistIds,
        }),
      }
    );

    return res.status(200).json({ message: "Playlists processed" });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
