const element = document.getElementById('content');
const dialog = document.getElementById('add-dialog');
const form = dialog.querySelector('form');

dialog.addEventListener('close', async () => {
    if (dialog.returnValue === 'cancel') {
        return;
    }
    const response = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            stageName: form.elements.stageName.value,
            nationality: form.elements.nationality.value,
            isActive: form.elements.isActive.checked,
        }),
    });
    if (response.ok) {
        loadAndRenderArtists(element);
    } else {
        alert('Operation failed. Please try again later.');
    }
});

await loadAndRenderArtists(element);

async function loadAndRenderArtists(element) {
    element.textContent = 'Artists: Loading…';
    const response = await fetch('/api/artists');
    if (response.ok) {
        const artists = await response.json();
        renderArtists(artists, element);
    } else {
        element.textContent = 'Failed to load artists. Please try again later.';
    }
}

function renderArtists(artists, element) {
    element.textContent = `Artists: ${artists.length}`;
    const ul = document.createElement('ul');
    for (const artist of artists) {
        const li = document.createElement('li');
        renderArtist(artist, li);
        ul.appendChild(li);
    }
    element.appendChild(ul);
}

function renderArtist(artist, element) {
    const a = document.createElement('a');
    a.href = `artist.html?id=${artist.id}`;
    a.textContent = artist.stageName;
    element.appendChild(a);
}
