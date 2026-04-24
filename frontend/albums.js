const element = document.getElementById('content');
await loadAndRenderAlbums(element);

async function loadAndRenderAlbums(element) {
    element.textContent = 'Albums: Loading…';
    const response = await fetch('/api/albums');
    if (response.ok) {
        const albums = await response.json();
        renderAlbums(albums, element);
    } else {
        element.textContent = 'Failed to load albums. Please try again later.';
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