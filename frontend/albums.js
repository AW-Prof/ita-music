
const element = document.getElementById('content');
const dialog = document.getElementById('add-dialog');
const form = dialog.querySelector('form');

dialog.addEventListener('close', async () => {
    if (dialog.returnValue !== 'add') {
        return;
    }

    const response = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: form.elements.title.value,
            artistId: Number(form.elements.artistId.value),
            releaseDate: form.elements.releaseDate.value || null,
            riaaCertificate: form.elements.riaaCertificate.value || null,
        }),
    });

    if (response.ok) {
        form.reset();
        await loadAndRenderAlbums(element);
    } else {
        alert('Operation failed. Please try again later.');
    }
});

await loadArtists();
await loadAndRenderAlbums(element);

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

async function loadAndRenderAlbums(element) {
    element.textContent = 'Albums: Loading…';
    const response = await fetch('/api/albums');

    if (response.ok) {
        const albums = await response.json();
        renderAlbums(albums, element);
    } else {
        element.textContent =
            'Failed to load albums. Please try again later.';
    }
}

function renderAlbums(albums, element) {
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
