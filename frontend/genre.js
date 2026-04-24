const element = document.getElementById('content');
const params = new URLSearchParams(window.location.search);
const genreId = params.get('id');

await loadAndRenderGenre(genreId, element);

async function loadAndRenderGenre(genreId, element) {
    element.textContent = 'Loading…';
    const response = await fetch(`/api/genre/${genreId}`);
    if (response.ok) {
        const genre = await response.json();
        element.textContent = '';
        const genreElement = document.createElement('div');
        const tracksElement = document.createElement('div');
        renderGenre(genre, genreElement);
        element.appendChild(genreElement);
        element.appendChild(tracksElement);
        await loadAndRenderTracks(genreId, tracksElement);
    } else {
        element.textContent = 'Failed to load genre. Please try again later';
    }
}

function renderGenre(genre, element) {
    const titleElement = document.createElement('h1');
    titleElement.textContent = `Genre: ${genre.name}`;
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = `Description: ${genre.description}`;
    element.appendChild(titleElement);
    element.appendChild(descriptionElement);
}

async function loadAndRenderTracks(genreId, element) {
    element.textContent = 'Tracks: Loading…';
    const response = await fetch (`/api/genre/${genreId}/tracks`);
    if (response.ok) {
        const tracks = await response.json();
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