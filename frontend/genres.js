const element = document.getElementById('content');
await loadAndRenderGenres(element);

async function loadAndRenderGenres(element) {
    element.textContent = 'Genres: Loading…';
    const response = await fetch('/api/genres');
    if (response.ok) {
        const genres = await response.json();
        renderGenres(genres, element);
    } else {
        element.textContent = 'Failed to load genres. Please try again later.';
    }
}

function renderGenres(genres, element) {
    element.textContent = `Genres: ${genres.length}`;
    const ul = document.createElement('ul');
    for (const genre of genres) {
        const li = document.createElement('li');
        renderGenre(genre, li);
        ul.appendChild(li);
    }
    element.appendChild(ul);
}

function renderGenre(genre, element) {
    const a = document.createElement('a');
    a.href = `genre.html?id=${genre.id}`;
    a.textContent = genre.name;
    element.appendChild(a);
}