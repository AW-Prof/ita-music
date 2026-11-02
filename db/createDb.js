import { connect } from './connect.js';
import upload from 'pg-upload';

const db = await connect();
const timestamp = (await db.query('select now() as timestamp')).rows[0]['timestamp'];
console.log(`Recreating database on ${timestamp}...`);

console.log('Dropping existing tables...');
await db.query('drop table if exists playlist_track');
await db.query('drop table if exists playlists');
await db.query('drop table if exists users');
await db.query('drop table if exists tracks');
await db.query('drop table if exists genres');
await db.query('drop table if exists media_types');
await db.query('drop table if exists albums');
await db.query('drop table if exists artists');

console.log('Creating tables...');
await db.query(`
    create table artists (
        artist_id   integer primary key,
        stage_name  text,
        nationality char(2) not null,
        active      boolean not null default true,
        unique (stage_name, nationality)
    )
`);
await db.query(`
    create table albums (
        album_id         integer primary key,
        artist_id        integer not null references artists,
        release_date     date,
        title            text,
        riaa_certificate text
    )
`);
await db.query(`
    create table media_types (
        media_type_id integer primary key,
        bit_depth     integer,
        sample_rate   real,
        lossless      boolean,
        name          text,
        description   text
    )
`);
await db.query(`
    create table genres (
        genre_id    integer primary key,
        name        text,
        description text
    )
`);
await db.query(`
    create table tracks (
        track_id      integer primary key,
        album_id      integer not null references albums,
        media_type_id integer not null references media_types,
        genre_id      integer not null references genres,
        milliseconds  integer check (milliseconds >= 0),
        bytes         bigint,
        unit_price    numeric(10, 2),
        title         text,

        constraint    making_money
        check         (unit_price > 0.50 + 0.13 * (bytes / 10000000.0))
    )
`);
await db.query(`
    create table users (
        user_id     bigint primary key,
        signed_up   timestamp,
        active      boolean,
        screen_name text,
        email       text
    )
`);
await db.query(`
    create table playlists (
        playlist_id bigint primary key,
        user_id     bigint not null references users,
        created     timestamp,
        name        text
    )
`);
await db.query(`
    create table playlist_track (
        playlist_id bigint not null references playlists,
        track_id    integer not null references tracks
    )
`);

console.log('Importing csv-data into tables...')
await upload(db, 'db/artists.csv', `
    copy  artists (artist_id, stage_name, nationality)
    from  stdin
    with  csv encoding 'UTF-8'
    where nationality is not null
`);
await db.query(`
    insert into artists (artist_id, stage_name, nationality)
    values (301, 'Nirvana', 'GB')
`);
await db.query(`
    update artists
    set    active = false
    where  stage_name = 'The Beatles'
`);
await db.query('drop table if exists albums_staging');
await db.query(`
    create table albums_staging (
      id       integer,
      title    text,
      artist   integer,
      released date,
      riaa     text
    )
`);
await upload(db, 'db/albums.csv', `
    copy albums_staging
    from stdin
    with csv header encoding 'UTF-8'
`);
await db.query(`
    insert into albums (album_id, artist_id, title, release_date, riaa_certificate)
    select id, artist, title, released, riaa
    from   albums_staging
    where  artist in (select artist_id from artists)
`);
await db.query('drop table albums_staging');
await upload(db, 'db/media_types.csv', `
    copy media_types (media_type_id, name, description, sample_rate, bit_depth, lossless)
    from stdin
    with csv header encoding 'UTF-8'
`);
await upload(db, 'db/genres.csv', `
    copy genres (name, genre_id, description)
    from stdin
    with csv encoding 'UTF-8'
`);
await db.query('drop table if exists tracks_staging');
await db.query(`
    create table tracks_staging (
      ID               integer,
      Title            text,
      Album            integer,
      "Media type"     integer,
      Genre            integer,
      "Duration in ms" integer,
      "Size in bytes"  bigint,
      "Price in USD"   numeric(10, 2)
    )
`);
await upload(db, 'db/tracks.csv', `
    copy tracks_staging
    from stdin
    with csv header encoding 'win1252'
`);
await db.query(`
    insert into tracks (track_id, album_id, media_type_id, genre_id, milliseconds, bytes, unit_price, title)
    select ID, Album, "Media type", Genre, "Duration in ms", "Size in bytes", "Price in USD", Title
    from   tracks_staging
    where  ("Price in USD" > 0.50 + 0.13 * ("Size in bytes" / 10000000.0))
    and    Album in (select album_id from albums)
`);
await db.query('drop table tracks_staging');
await upload(db, 'db/users.csv', `
    copy users (user_id, screen_name, email, active, signed_up)
    from stdin
    with csv encoding 'UTF-8'
`);
await upload(db, 'db/playlists.csv', `
    copy playlists (playlist_id, created, user_id, name)
    from stdin
    with csv header encoding 'UTF-8'
`);
await db.query('drop table if exists playlist_track_staging');
await db.query(`create table playlist_track_staging (
        playlist bigint,
        track    integer
    )
`);
await upload(db, 'db/playlist_track.csv', `
    copy playlist_track_staging
    from stdin
    with csv header encoding 'UTF-8'
`);
await db.query(`
    insert into playlist_track (playlist_id, track_id)
    select playlist, track
    from   playlist_track_staging
    where  playlist in (select playlist_id from playlists)
    and    track in (select track_id from tracks)
`);
await db.query('drop table playlist_track_staging');
await db.end();
console.log('Database successfully recreated.');