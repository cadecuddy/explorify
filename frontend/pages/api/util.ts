import { NextApiRequest } from "next/types";

// some util file
export function getAccessToken(req: NextApiRequest): string {
    const accessToken: string = (req.headers.authorization as string).split(
        " "
    )[1];

    return accessToken
}