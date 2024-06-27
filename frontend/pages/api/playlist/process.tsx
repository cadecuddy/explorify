import type { NextApiRequest, NextApiResponse } from "next";

type RequestData = {
  publicPlaylists: string[];
};

type ResponseData = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const { publicPlaylists }: RequestData = req.body;
    // send publicPlaylists to a service that processes them on localhost:3001

    fetch("http://localhost:3001/playlists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicPlaylists }),
    });

    res.status(200).json({ message: "Processing playlists" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
