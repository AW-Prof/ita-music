
const element = document.getElementById('content');
const params = new URLSearchParams(window.location.search);
const albumId = params.get('id');
const dialog = document.getElementById('edit-dialog');
const form = dialog.querySelector('form');

dialog.addEventListener('close', async () => {
    if (dialog.returnValue !== 'save') {
        return;
    }

    const response = await fetch(`/api/album/${albumId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: form.elements.title.value,
            artistId: Number(form.elements.artistId.value),
            releaseDate: form.elements.releaseDate.value || null,
            riaaCertificate: form.elements.riaaCertificate.value || null,
        }),
    });

    if (response.ok) {
        await loadAndRenderAlbum(albumId, element);
    } else {
        alert('Operation failed. Please try again later.');
    }
});

await loadArtists();
await loadAndRenderAlbum(albumId, element);

async function loadArtists() {
    const response = await fetch('/api/artists');

    if (response.ok) {
        const artists = await response.json();
        const select = form.elements.artistId;

        for (const artist of artists) {
            const option = document.createElement('option');
            option.value = artist.id;
            option.textContent = artist.stageName;
            select.appendChild(option);
        }
    } else {
        alert('Failed to load artists. Please try again later.');
    }
}

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
        element.textContent =
            'Failed to load album. Please try again later.';
    }
}

function renderAlbum(album, element) {
    const titleElement = document.createElement('h1');
    titleElement.textContent = `Album: ${album.title}`;

    const artistElement = document.createElement('p');
    artistElement.textContent = 'Artist: ';

    const artistLinkElement = document.createElement('a');
    artistLinkElement.href = `artist.html?id=${album.artistId}`;
    artistLinkElement.textContent = album.artistStageName;
    artistElement.appendChild(artistLinkElement);

    const releaseDateElement = document.createElement('p');
    releaseDateElement.textContent =
        `Released: ${album.releaseDate?.substring(0, 10) ?? 'Unknown'}`;

    const riaaElement = document.createElement('p');
    riaaElement.textContent =
        `RIAA certificate: ${album.riaaCertificate}`;

    element.appendChild(titleElement);
    element.appendChild(artistElement);
    element.appendChild(releaseDateElement);
    element.appendChild(riaaElement);

    // Fill edit form with existing album information
    form.elements.title.value = album.title;
    form.elements.artistId.value = album.artistId;
    form.elements.releaseDate.value =
        album.releaseDate?.substring(0, 10) ?? '';

    const certificate = album.riaaCertificate === '(none)'
        ? ''
        : album.riaaCertificate ?? '';

    const select = form.elements.riaaCertificate;

    if (certificate &&
        !Array.from(select.options).some(
            option => option.value === certificate
        )) {
        const option = document.createElement('option');
        option.value = certificate;
        option.textContent = certificate;
        select.appendChild(option);
    }

    select.value = certificate;
}

async function loadAndRenderTracks(albumId, element) {
    element.textContent = 'Tracks: Loading…';

    const response = await fetch(`/api/album/${albumId}/tracks`);

    if (response.ok) {
        const tracks = await response.json();
        element.textContent = '';
        renderTracks(tracks, element);
    } else {
        element.textContent =
            'Failed to load tracks. Please try again later.';
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
