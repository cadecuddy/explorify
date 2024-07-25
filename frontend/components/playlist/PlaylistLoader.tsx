import { Session } from "next-auth";

const CURRENT_USER_PLAYLIST_ENDPOINT = `https://api.spotify.com/v1/me/playlists?limit=50`;

/**
 * Fetch the current user's public playlists
 * @param session NextAuth session object
 * @returns Array of Spotify playlist objectsF
 */
export async function fetchPublicPlaylists(
  session: Session
): Promise<SpotifyApi.PlaylistBaseObject[] | undefined> {
  if (!session || !session.accessToken) return;
  const playlists = [];

  try {
    const response = await fetch(CURRENT_USER_PLAYLIST_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    let data: SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified> =
      await response.json();
    playlists.push(...data.items);

    while (data.next) {
      const response = await fetch(data.next, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      data = await response.json();
      playlists.push(...data.items);
    }

    // only return public playlists with 1 or more tracks that are not made by Spotify
    return playlists.filter(
      (playlist) =>
        playlist.public &&
        playlist.owner.uri !== "spotify:user:spotify" &&
        playlist.tracks.total > 0
    );
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return;
  }
}
