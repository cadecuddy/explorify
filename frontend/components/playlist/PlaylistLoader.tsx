const CURRENT_USER_PLAYLIST_ENDPOINT = `https://api.spotify.com/v1/me/playlists?limit=50`;

/**
 * Fetch the current user's playlists. Ideally this would
 * only fetch the public ones, but from this endpoint we
 * can't tell if a playlist is public or not because their responses
 * are shitty.
 * @param session NextAuth session object
 * @returns Array of Spotify playlist objectsF
 */
export async function fetchUserPlaylists(
  accessToken: string
): Promise<SpotifyApi.PlaylistBaseObject[] | undefined> {
  if (!accessToken) return;
  const playlists = [];

  try {
    const response = await fetch(CURRENT_USER_PLAYLIST_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    let data: SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified> =
      await response.json();
    playlists.push(...data.items);

    while (data.next) {
      const response = await fetch(data.next, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
