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

    let data: SpotifyApi.PagingObject<SpotifyApi.PlaylistBaseObject> =
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

    return playlists.filter((playlist) => playlist.public);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return;
  }
}
