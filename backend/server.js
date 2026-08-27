import express from 'express';
import { pool } from '../db/connect.js';

const db = pool();

const port = process.env.port || 3002;
const server = express();
server.use(express.static('frontend'));
server.use(onEachRequest);
server.get('/api/artists', onGetArtists);
server.get('/api/artist/:artistId', onGetArtist);
server.get('/api/artist/:artistId/albums', onGetAlbumsForArtist);
server.get('/api/albums', onGetAlbums);
server.get('/api/album/:albumId', onGetAlbum);
server.get('/api/album/:albumId/tracks', onGetTracksForAlbum);
server.get('/api/tracks', onGetTracks);
server.get('/api/track/:trackId', onGetTrack);
server.get('/api/genres', onGetGenres);
server.get('/api/genre/:genreId', onGetGenre);
server.get('/api/genre/:genreId/tracks', onGetTracksForGenre);
server.listen(port, onServerReady);

async function onGetArtists(request, response) {
    const dbResult = await db.query(`
        select artist_id as id,
               stage_name as "stageName"
        from   artists
        order by stage_name asc
    `);
    response.json(dbResult.rows);
}

async function onGetArtist(request, response) {
    const artistId = request.params.artistId;
    const dbResult = await db.query(`
        select artist_id as id,
               stage_name as "stageName",
               nationality,
               active as "isActive"
        from   artists
        where  artist_id = $1
    `, [artistId]);
    const rows = dbResult.rows;
    if (rows.length === 0) {
        response.statusCode(404);
    } else {
        response.json(rows[0]);
    }
}

async function onGetAlbumsForArtist(request, response) {
    const artistId = request.params.artistId;
    const dbResult = await db.query(`
        select   album_id as id,
                 title
        from     albums
        where    artist_id = $1
        order by release_date desc
    `, [artistId]);
    response.json(dbResult.rows);
}

async function onGetAlbums(request, response) {
    const dbResult = await db.query(`
        select   album_id as id,
                 title
        from     albums
        order by title asc
    `);
    response.json(dbResult.rows);
}

async function onGetAlbum(request, response) {
    const albumId = request.params.albumId;
    const dbResult = await db.query(`
        select al.album_id as id,
               al.title,
               al.release_date as "releaseDate",
               coalesce(al.riaa_certificate, '(none)') as "riaaCertificate",
               ar.artist_id as "artistId",
               ar.stage_name as "artistStageName"
        from   albums al
        join   artists ar using (artist_id)
        where  al.album_id = $1
    `, [albumId]);
    const rows = dbResult.rows;
    if (rows.length === 0) {
        response.statusCode(404);
    } else {
        response.json(rows[0]);
    }
}

async function onGetTracksForAlbum(request, response) {
    const albumId = request.params.albumId;
    const dbResult = await db.query(`
        select   track_id as id,
                 title
        from     tracks
        where    album_id = $1
        order by title asc
    `, [albumId]);
    response.json(dbResult.rows);
}

async function onGetTracks(request, response) {
    const dbResult = await db.query(`
        select   track_id as id,
                 title
        from     tracks
        order by title asc
    `);
    response.json(dbResult.rows);
}

async function onGetTrack(request, response) {
    const trackId = request.params.trackId;
    const dbResult = await db.query(`
        select t.track_id as id,
               t.title,
               t.milliseconds / 1000 as duration,
               t.unit_price as price,
               ar.artist_id as "artistId",
               ar.stage_name as "artistStageName",
               al.album_id as "albumId",
               al.title as "albumTitle",
               g.genre_id as "genreId",
               g.name as "genreName"
        from   tracks t
        join   albums al using (album_id)
        join   artists ar using (artist_id)
        join   genres g using (genre_id)
        where  t.track_id = $1
    `, [trackId]);
    const rows = dbResult.rows;
    if (rows.length === 0) {
        response.statusCode(404);
    } else {
        response.json(rows[0]);
    }
}

async function onGetGenres(request, response) {
    const dbResult = await db.query(`
        select   genre_id as id,
                 name
        from     genres
        order by name asc
    `);
    response.json(dbResult.rows);
}

async function onGetGenre(request, response) {
    const genreId = request.params.genreId;
    const dbResult = await db.query(`
        select genre_id as id,
               name,
               description
        from   genres
        where  genre_id = $1
    `, [genreId]);
    const rows = dbResult.rows;
    if (rows.length === 0) {
        response.statusCode(404);
    } else {
        response.json(rows[0]);
    }
}

async function onGetTracksForGenre(request, response) {
    const genreId = request.params.genreId;
    const dbResult = await db.query(`
        select   track_id as id,
                 title
        from     tracks
        where    genre_id = $1
        order by title asc
    `, [genreId]);
    response.json(dbResult.rows);
}

function onServerReady() {
    console.log('Webserver running on port', port);
}

function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}