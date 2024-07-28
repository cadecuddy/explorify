import { Session } from "next-auth";

export type TrackSelection = {
    name: string;
    artist: string[];
    picture: string;
    id: string;
}

export type PlaylistSearchResult = {
    id: string;
    description: string;
    url: string;
    followers: number;
    image: string;
    name: string;
    ownerUrl: string;
    ownerName: string;
    tracks: number;
}

export async function fetchSpotifyTracks(songName: string, session: Session): Promise<TrackSelection[]> {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${songName}&type=track&limit=5&offset=0`,
        {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        }
    );

    let tracks: SpotifyApi.TrackSearchResponse = await response.json();

    let suggestions: TrackSelection[] = tracks.tracks.items.map((track) => {
        return {
            name: track.name,
            artist: track.artists.map((artist) => artist.name),
            picture: track.album.images[0].url,
            id: track.id,
        };
    }
    );

    return suggestions;
}