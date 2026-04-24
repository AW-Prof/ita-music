const element = document.getElementById('content');
const params = new URLSearchParams(window.location.search);
const albumId = params.get('id');

await loadAndRenderAlbum(albumId, element);

async function loadAndRenderAlbum(albumId, element) {
    element.textContent = 'Loading…';
    const response = await fetch(`/api/album/${albumId}`);
    if (response.ok) {
        const album = await response.json();
        element.textContent = '';
        const albumElement = document.createElement('div');
        const tracksElement = document.createElement('div');
        renderAlbum(album, albumElement);
        element.appendChild(albumElement);
        element.appendChild(tracksElement);
        await loadAndRenderTracks(albumId, tracksElement);
    } else {
        element.textContent = 'Failed to load album. Please try again later';
    }
}

function renderAlbum(album, element) {
    const titleElement = document.createElement('h1');
    titleElement.textContent = `Album: ${album.title}`;

    const artistElement = document.createElement('p');
    artistElement.textContent = 'Artist: '
    const artistLinkElement = document.createElement('a');
    artistLinkElement.href = `artist.html?id=${album.artistId}`;
    artistLinkElement.textContent = album.artistStageName;
    artistElement.appendChild(artistLinkElement);

    const releaseDateElement = document.createElement('p');
    releaseDateElement.textContent = `Released: ${album.releaseDate.substring(0, 10)}`;

    const riaaElement = document.createElement('p');
    riaaElement.textContent = `RIAA certificate: ${album.riaaCertificate}`;

    element.appendChild(titleElement);
    element.appendChild(artistElement);
    element.appendChild(releaseDateElement);
    element.appendChild(riaaElement);
}

async function loadAndRenderTracks(albumId, element) {
    element.textContent = 'Tracks: Loading…';
    const response = await fetch (`/api/album/${albumId}/tracks`);
    if (response.ok) {
        const tracks = await response.json();
        element.textContent = '';
        renderTracks(tracks, element);
    } else {
        element.textContent = 'Failed to load tracks. Please try again later.';
    }
}

function renderTracks(tracks, element) {
    element.textContent = `Tracks: ${tracks.length}`;
    const ul = document.createElement('ul');
    for (const track of tracks) {
        const li = document.createElement('li');
        renderTrack(track, li);
        ul.appendChild(li);
    }
    element.appendChild(ul);
}

function renderTrack(track, element) {
    const a = document.createElement('a');
    a.href = `track.html?id=${track.id}`;
    a.textContent = track.title;
    element.appendChild(a);
}