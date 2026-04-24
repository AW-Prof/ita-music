const element = document.getElementById('content');
await loadAndRenderTracks(element);

async function loadAndRenderTracks(element) {
    element.textContent = 'Tracks: Loading…';
    const response = await fetch('/api/tracks');
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