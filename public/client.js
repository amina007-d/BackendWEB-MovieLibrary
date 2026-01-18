const API_URL = '/api/movies';

// State
let currentMovies = [];

// DOM Elements
const movieGrid = document.getElementById('movieGrid');
const searchInput = document.getElementById('searchInput');
const genreSelect = document.getElementById('genreSelect');
const sortSelect = document.getElementById('sortSelect');
const yearSelect = document.getElementById('yearSelect');

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
    setupEventListeners();
});

function setupEventListeners() {
    searchInput.addEventListener('input', debounce((e) => {
        fetchMovies();
    }, 500));

    genreSelect.addEventListener('change', fetchMovies);
    sortSelect.addEventListener('change', fetchMovies);
    yearSelect.addEventListener('change', fetchMovies);
}

// Fetch Movies from API
async function fetchMovies() {
    try {
        const params = new URLSearchParams();

        if (searchInput.value.trim()) {
            params.append('title', searchInput.value.trim());
        }
        if (genreSelect.value) {
            params.append('genre', genreSelect.value);
        }
        if (yearSelect.value) {
            params.append('year', yearSelect.value);
        }

        // Handle Sorting
        const sortValue = sortSelect.value; // e.g., "year_desc", "title_asc"
        if (sortValue) {
            const [field, order] = sortValue.split('_');
            params.append('sortBy', field);
            params.append('order', order);
        }

        const response = await fetch(`${API_URL}?${params.toString()}`);
        const data = await response.json();

        // The API returns { count: number, data: [] }
        currentMovies = data.data || [];
        renderMovies(currentMovies);

    } catch (error) {
        console.error('Error fetching movies:', error);
        movieGrid.innerHTML = '<p class="error-msg">Failed to load movies. Please try again later.</p>';
    }
}

// Render Movies
function renderMovies(movies) {
    movieGrid.innerHTML = '';

    if (movies.length === 0) {
        movieGrid.innerHTML = `
      <div class="no-results">
        <p>No movies found matching your criteria.</p>
      </div>
    `;
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        // Fallback for missing fields
        const title = movie.title || 'Untitled';
        const year = movie.year || 'N/A';
        const genre = movie.genre || 'Unknown Genre';
        const rating = movie.rating !== undefined && movie.rating !== null ? `${movie.rating}/10` : 'No Rating';
        const director = movie.director ? `By ${movie.director}` : '';

        card.innerHTML = `
      <div class="card-content">
        <div class="card-header">
            <span class="genre-tag">${genre}</span>
            <span class="rating-tag">${rating}</span>
        </div>
        <h3 class="movie-title">${title}</h3>
        <p class="movie-meta">${year} • ${director}</p>
        <p class="movie-desc">${movie.description || 'No description available.'}</p>
      </div>
      <div class="card-actions">
          <button class="btn-delete" onclick="deleteMovie('${movie._id}')">Delete</button>
      </div>
    `;
        movieGrid.appendChild(card);
    });
}

// Delete Movie
window.deleteMovie = async (id) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchMovies(); // Reload list
        } else {
            alert('Failed to delete movie');
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Error deleting movie');
    }
};

// Utility: Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
