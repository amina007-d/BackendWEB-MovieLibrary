const API_URL = '/api/movies';

// State
let currentMovies = [];
let isEditing = false;
let editingId = null;

// DOM Elements
const movieGrid = document.getElementById('movieGrid');
const searchInput = document.getElementById('searchInput');
const genreSelect = document.getElementById('genreSelect');
const sortSelect = document.getElementById('sortSelect');
const yearSelect = document.getElementById('yearSelect');
const addMovieBtn = document.getElementById('addMovieBtn');
const movieModal = document.getElementById('movieModal');
const movieForm = document.getElementById('movieForm');
const modalTitle = document.getElementById('modalTitle');
const cancelBtn = document.getElementById('cancelBtn');
const toast = document.getElementById('toast');

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
    setupEventListeners();
});

function setupEventListeners() {
    searchInput.addEventListener('input', debounce(() => {
        fetchMovies();
    }, 500));

    genreSelect.addEventListener('change', fetchMovies);
    sortSelect.addEventListener('change', fetchMovies);
    yearSelect.addEventListener('change', fetchMovies);
    
    addMovieBtn.addEventListener('click', openAddModal);
    cancelBtn.addEventListener('click', closeModal);
    movieForm.addEventListener('submit', handleFormSubmit);
    
    // Close modal when clicking outside
    movieModal.addEventListener('click', (e) => {
        if (e.target === movieModal) closeModal();
    });
}

// Fetch Movies from API
async function fetchMovies() {
    try {
        showLoading();
        
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
        const sortValue = sortSelect.value;
        if (sortValue) {
            const [field, order] = sortValue.split('_');
            params.append('sortBy', field);
            params.append('order', order);
        }

        const response = await fetch(`${API_URL}?${params.toString()}`);
        const data = await response.json();

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
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3>No movies found</h3>
                <p>Try adjusting your search or filters, or add a new movie!</p>
            </div>
        `;
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        const title = movie.title || 'Untitled';
        const year = movie.year || 'N/A';
        const genre = movie.genre || 'Unknown Genre';
        const rating = movie.rating !== undefined && movie.rating !== null ? `${movie.rating}/10` : 'No Rating';
        const director = movie.director ? `${movie.director}` : 'Unknown Director';

        card.innerHTML = `
            <div class="card-content">
                <div class="card-header">
                    <span class="genre-tag">${genre}</span>
                    <span class="rating-tag">${rating}</span>
                </div>
                <h3 class="movie-title">${title}</h3>
                <p class="movie-meta">
                    <span class="year-badge">${year}</span>
                    <span class="director-name">${director}</span>
                </p>
                <p class="movie-desc">${movie.description || 'No description available.'}</p>
            </div>
            <div class="card-actions">
                <button class="btn-edit" onclick="editMovie('${movie._id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                </button>
                <button class="btn-delete" onclick="deleteMovie('${movie._id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>
            </div>
        `;
        movieGrid.appendChild(card);
    });
}

// Modal Functions
function openAddModal() {
    isEditing = false;
    editingId = null;
    modalTitle.textContent = 'Add New Movie';
    movieForm.reset();
    movieModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    movieModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    movieForm.reset();
    isEditing = false;
    editingId = null;
}

// Edit Movie
window.editMovie = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch movie');
        
        const movie = await response.json();
        
        isEditing = true;
        editingId = id;
        modalTitle.textContent = 'Edit Movie';
        
        document.getElementById('title').value = movie.title || '';
        document.getElementById('genre').value = movie.genre || '';
        document.getElementById('year').value = movie.year || '';
        document.getElementById('rating').value = movie.rating || '';
        document.getElementById('director').value = movie.director || '';
        document.getElementById('description').value = movie.description || '';
        
        movieModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading movie:', error);
        showToast('Failed to load movie details', 'error');
    }
};

// Handle Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value.trim(),
        genre: document.getElementById('genre').value,
        year: parseInt(document.getElementById('year').value),
        rating: parseFloat(document.getElementById('rating').value) || null,
        director: document.getElementById('director').value.trim() || null,
        description: document.getElementById('description').value.trim() || null
    };

    try {
        const url = isEditing ? `${API_URL}/${editingId}` : API_URL;
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Operation failed');
        }

        showToast(isEditing ? 'Movie updated successfully!' : 'Movie added successfully!', 'success');
        closeModal();
        fetchMovies();
    } catch (error) {
        console.error('Error saving movie:', error);
        showToast(error.message || 'Failed to save movie', 'error');
    }
}

// Delete Movie
window.deleteMovie = async (id) => {
    if (!confirm('Are you sure you want to delete this movie? This action cannot be undone.')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Movie deleted successfully', 'success');
            fetchMovies();
        } else {
            throw new Error('Failed to delete movie');
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
        showToast('Failed to delete movie', 'error');
    }
};

// Toast Notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Loading State
function showLoading() {
    movieGrid.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading movies...</p>
        </div>
    `;
}

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