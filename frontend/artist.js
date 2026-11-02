const element = document.getElementById('content');
const params = new URLSearchParams(window.location.search);
const artistId = params.get('id');
const deleteButton = document.getElementById('delete');
const dialog = document.getElementById('edit-dialog');
const form = dialog.querySelector('form');

dialog.addEventListener('close', async () => {
    if (dialog.returnValue === 'cancel') {
        return;
    }
    const response = await fetch(`/api/artist/${artistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            stageName: form.elements.stageName.value,
            nationality: form.elements.nationality.value,
            isActive: form.elements.isActive.checked,
        }),
    });
    if (response.ok) {
        loadAndRenderArtist(artistId, element);
    } else {
        alert('Operation failed. Please try again later.');
    }
});

deleteButton.addEventListener('click', async () => {
    deleteButton.disabled = true;
    const response = await fetch(`/api/artist/${artistId}`, { method: 'DELETE' });
    deleteButton.disabled = false;
    if (response.ok) {
        window.location.href = '/artists.html';
    } else {
        alert('Operation failed. Please try again later.');
    }
});

await loadAndRenderArtist(artistId, element);

async function loadAndRenderArtist(artistId, element) {
    element.textContent = 'Loading…';
    const response = await fetch(`/api/artist/${artistId}`);
    if (response.ok) {
        const artist = await response.json();
        element.textContent = '';
        const artistElement = document.createElement('div');
        const albumsElement = document.createElement('div');
        renderArtist(artist, artistElement);
        element.appendChild(artistElement);
        element.appendChild(albumsElement);
        await loadAndRenderAlbums(artistId, albumsElement);
    } else {
        element.textContent = 'Failed to load artist. Please try again later';
    }
}

function renderArtist(artist, element) {
    const stageNameElement = document.createElement('h1');
    stageNameElement.textContent = `Artist: ${artist.stageName}`;
    const nationalityElement = document.createElement('p');
    nationalityElement.textContent = `Nationality: ${artist.nationality}`;
    const activeElement = document.createElement('p');
    activeElement.textContent = `Active: ${artist.isActive ? 'yes' : 'no'}`;
    element.appendChild(stageNameElement);
    element.appendChild(nationalityElement);
    element.appendChild(activeElement);
    form.elements.stageName.value = artist.stageName;
    form.elements.nationality.value = artist.nationality;
    form.elements.isActive.checked = artist.isActive;
}

async function loadAndRenderAlbums(artistId, element) {
    element.textContent = 'Albums: Loading…';
    const response = await fetch (`/api/artist/${artistId}/albums`);
    if (response.ok) {
        const albums = await response.json();
        renderAlbums(albums, element);
    } else {
        element.textContent = 'Failed to load albums. Please try again later.';
    }
}

function renderAlbums(albums, element) {
    deleteButton.disabled = (albums.length > 0);
    element.textContent = `Albums: ${albums.length}`;
    const ul = document.createElement('ul');
    for (const album of albums) {
        const li = document.createElement('li');
        renderAlbum(album, li);
        ul.appendChild(li);
    }
    element.appendChild(ul);
}

function renderAlbum(album, element) {
    const a = document.createElement('a');
    a.href = `album.html?id=${album.id}`;
    a.textContent = album.title;
    element.appendChild(a);
}