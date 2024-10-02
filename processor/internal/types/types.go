package types

const (
	PLAYLIST_ENDPOINT       = "https://api.spotify.com/v1/playlists/"
	PLAYLIST_METADATA_QUERY = "fields=description%2Cexternal_urls.spotify%2Cfollowers%2Cid%2Cimages%2Cname%2Cowner%2Csnapshot_id"
	TRACK_METADATA_QUERY    = "fields=href%2Climit%2Cnext%2Coffset%2Cprevious%2Ctotal%2Citems%28track%28album%28album_type%2Ctotal_tracks%2Cexternal_urls%2Cid%2Cimages%2Cname%2Crelease_date%2Ctype%2Curi%2Cartists%29%2Cartists%2Cduration_ms%2Cexplicit%2Cexternal_urls%2Cid%2Cname%2Cpopularity%2Cpreview_url%2Curi%29%29"
)

type PlaylistMessage struct {
	AccessToken string `json:"access_token"`
	PlaylistId  string `json:"playlist_id"`
}
