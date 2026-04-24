const element = document.getElementById('content');
const params = new URLSearchParams(window.location.search);
const trackId = params.get('id');

await loadAndRenderTrack(trackId, element);

async function loadAndRenderTrack(trackId, element) {
    element.textContent = 'Loading…';
    const response = await fetch(`/api/track/${trackId}`);
    if (response.ok) {
        const track = await response.json();
        element.textContent = '';
        renderTrack(track, element);
    } else {
        element.textContent = 'Failed to load track. Please try again later';
    }
}

function renderTrack(track, element) {
    const titleElement = document.createElement('h1');
    titleElement.textContent = `Track: ${track.title}`;

    const artistElement = document.createElement('p');
    artistElement.textContent = 'Artist: '
    const artistLinkElement = document.createElement('a');
    artistLinkElement.href = `artist.html?id=${track.artistId}`;
    artistLinkElement.textContent = track.artistStageName;
    artistElement.appendChild(artistLinkElement);

    const albumElement = document.createElement('p');
    albumElement.textContent = 'Album: '
    const albumLinkElement = document.createElement('a');
    albumLinkElement.href = `album.html?id=${track.albumId}`;
    albumLinkElement.textContent = track.albumTitle;
    albumElement.appendChild(albumLinkElement);
    
    const genreElement = document.createElement('p');
    genreElement.textContent = 'Genre: '
    const genreLinkElement = document.createElement('a');
    genreLinkElement.href = `genre.html?id=${track.genreId}`;
    genreLinkElement.textContent = track.genreName;
    genreElement.appendChild(genreLinkElement);
    
    const durationElement = document.createElement('p');
    durationElement.textContent = `Duration: ${track.duration}s`;
    
    const priceElement = document.createElement('p');
    priceElement.textContent = `Price: $${track.price}`;

    element.appendChild(titleElement);
    element.appendChild(artistElement);
    element.appendChild(albumElement);
    element.appendChild(genreElement);
    element.appendChild(durationElement);
    element.appendChild(priceElement);
}
