import { Session } from "next-auth";

export async function fetchSpotifyTracks(songName: string, session: Session): Promise<string[]> {
    console.log(session);

    const response = await fetch(`https://api.spotify.com/v1/search?q=${songName}&type=track&limit=4&offset=0`, {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    });

    let tracks: SpotifyApi.TrackSearchResponse = await response.json();

    // extract the track names from the response
    let trackNames: string[] = tracks.tracks.items.map((track) => track.name);
    return trackNames;
}