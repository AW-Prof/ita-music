
import express from 'express';
import { pool } from '../db/connect.js';

const db = pool();

const port = process.env.PORT || 3002;
const server = express();
server.use(express.json());
server.use(express.static('frontend'));
server.use(onEachRequest);

server.get('/api/artists', onGetArtists);
server.post('/api/artists', onPostArtist);
server.get('/api/artist/:artistId', onGetArtist);
server.put('/api/artist/:artistId', onPutArtist);
server.delete('/api/artist/:artistId', onDeleteArtist);
server.get('/api/artist/:artistId/albums', onGetAlbumsForArtist);

server.get('/api/albums', onGetAlbums);
server.post('/api/albums', onPostAlbum);
server.get('/api/album/:albumId', onGetAlbum);
server.put('/api/album/:albumId', onPutAlbum);
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
        order by lower(stage_name) asc
    `);
    response.json(dbResult.rows);
}

async function onPostArtist(request, response) {
    const stageName = request.body.stageName;
    const nationality = request.body.nationality;
    const isActive = request.body.isActive;
    const dbResult = await db.query(`
        insert into artists (artist_id, stage_name, nationality, active)
        values (1 + (select max(artist_id) from artists), $1, $2, $3)
    `, [stageName, nationality, isActive]);
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
        response.sendStatus(404);
    } else {
        response.json(rows[0]);
    }
}

async function onPutArtist(request, response) {
    const artistId = request.params.artistId;
    const stageName = request.body.stageName;
    const nationality = request.body.nationality;
    const isActive = request.body.isActive;

    const dbResult = await db.query(`
        update artists
        set    stage_name = $2,
               nationality = $3,
               active = $4
        where  artist_id = $1
    `, [artistId, stageName, nationality, isActive]);

    response.json(dbResult.rows);
}

async function onDeleteArtist(request, response) {
    const artistId = request.params.artistId;

    await db.query(`
        delete from artists
        where  artist_id = $1
    `, [artistId]);

    response.sendStatus(204);
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
        order by lower(title) asc
    `);

    response.json(dbResult.rows);
}

// Create new album
async function onPostAlbum(request, response) {
    const title = request.body.title;
    const artistId = request.body.artistId;
    const releaseDate = request.body.releaseDate;
    const riaaCertificate = request.body.riaaCertificate;

    if (
        typeof title !== 'string' ||
        !title.trim() ||
        !Number.isInteger(artistId) ||
        artistId <= 0
    ) {
        return response.status(400).json({
            error: 'Valid title and artist are required.'
        });
    }

    try {
        const dbResult = await db.query(`
            insert into albums (
                album_id,
                artist_id,
                release_date,
                title,
                riaa_certificate
            )
            values (
                (select coalesce(max(album_id), 0) + 1 from albums),
                $1, $2, $3, $4
            )
            returning album_id as id, title
        `, [
            artistId,
            releaseDate || null,
            title.trim(),
            riaaCertificate || null
        ]);

        response.status(201).json(dbResult.rows[0]);
    } catch (error) {
        console.error('Failed to add album:', error);

        if (error.code === '23503') {
            return response.status(400).json({
                error: 'The selected artist does not exist.'
            });
        }

        response.status(500).json({
            error: 'Failed to add album.'
        });
    }
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
        response.sendStatus(404);
    } else {
        response.json(rows[0]);
    }
}

// Edit existing album
async function onPutAlbum(request, response) {
    const albumId = request.params.albumId;
    const title = request.body.title;
    const artistId = request.body.artistId;
    const releaseDate = request.body.releaseDate;
    const riaaCertificate = request.body.riaaCertificate;

    if (
        typeof title !== 'string' ||
        !title.trim() ||
        !Number.isInteger(artistId) ||
        artistId <= 0
    ) {
        return response.status(400).json({
            error: 'Valid title and artist are required.'
        });
    }

    try {
        const dbResult = await db.query(`
            update albums
            set    title = $2,
                   artist_id = $3,
                   release_date = $4,
                   riaa_certificate = $5
            where  album_id = $1
            returning album_id as id, title
        `, [
            albumId,
            title.trim(),
            artistId,
            releaseDate || null,
            riaaCertificate || null
        ]);

        if (dbResult.rows.length === 0) {
            return response.sendStatus(404);
        }

        response.json(dbResult.rows[0]);
    } catch (error) {
        console.error('Failed to update album:', error);

        if (error.code === '23503') {
            return response.status(400).json({
                error: 'The selected artist does not exist.'
            });
        }

        if (error.code === '22007' || error.code === '22008') {
            return response.status(400).json({
                error: 'Invalid release date.'
            });
        }

        response.status(500).json({
            error: 'Failed to update album.'
        });
    }
}

async function onGetTracksForAlbum(request, response) {
    const albumId = request.params.albumId;

    const dbResult = await db.query(`
        select   track_id as id,
                 title
        from     tracks
        where    album_id = $1
        order by lower(title) asc
    `, [albumId]);

    response.json(dbResult.rows);
}

async function onGetTracks(request, response) {
    const dbResult = await db.query(`
        select   track_id as id,
                 title
        from     tracks
        order by lower(title) asc
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
        response.sendStatus(404);
    } else {
        response.json(rows[0]);
    }
}

async function onGetGenres(request, response) {
    const dbResult = await db.query(`
        select   genre_id as id,
                 name
        from     genres
        order by lower(name) asc
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
        response.sendStatus(404);
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
        order by lower(title) asc
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
