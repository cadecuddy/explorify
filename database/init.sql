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
    album_id VARCHAR(255) REFERENCES Album(id),
    duration INT,
    explicit BOOL,
    external_urls TEXT,
    preview_url VARCHAR(255),
    uri VARCHAR(255),
    type VARCHAR(255),
    artist_ids TEXT
);

CREATE TABLE IF NOT EXISTS TrackToPlaylist (
    PRIMARY KEY (track_id, playlist_id),
    track_id VARCHAR(255) REFERENCES Track(id),
    playlist_id VARCHAR(255) REFERENCES Playlist(id)
);