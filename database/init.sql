CREATE DATABASE IF NOT EXISTS explorify;

USE explorify;

CREATE TABLE IF NOT EXISTS Playlist (
    id VARCHAR(255) PRIMARY KEY,
    description TEXT,
    url VARCHAR(255),
    followers INT,
    image VARCHAR(255),
    name VARCHAR(255),
    owner_url VARCHAR(255),
    owner_displayName VARCHAR(255),
    snapshot_id VARCHAR(255),
    tracks_total INT
);

CREATE TABLE IF NOT EXISTS Artist (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    uri VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Genre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS PlaylistGenre (
    playlist_id VARCHAR(255) REFERENCES Playlist(id),
    genre_id INT REFERENCES Genre(id),
    PRIMARY KEY (playlist_id, genre_id)
);

CREATE TABLE IF NOT EXISTS Album (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    uri VARCHAR(255),
    images TEXT,
    release_date VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Track (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    album_id VARCHAR(255),
    duration INT,
    explicit BOOLEAN,
    external_urls TEXT,
    preview_url VARCHAR(255),
    uri VARCHAR(255),
    type VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS TrackToArtist (
    track_id VARCHAR(255) REFERENCES Track(id),
    artist_id VARCHAR(255) REFERENCES Artist(id),
    PRIMARY KEY (track_id, artist_id)
);

CREATE TABLE IF NOT EXISTS TrackToPlaylist (
    track_id VARCHAR(255) REFERENCES Track(id),
    playlist_id VARCHAR(255) REFERENCES Playlist(id),
    PRIMARY KEY (track_id, playlist_id)
);

CREATE INDEX idx_track_id ON TrackToPlaylist(track_id);

CREATE INDEX idx_playlist_id ON TrackToPlaylist(playlist_id);