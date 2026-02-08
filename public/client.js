const API_URL = '/api/movies';

// State
let currentMovies = [];
let isEditing = false;
let editingId = null;
let isLoggedIn = false;
let currentUser = null;
let isAdmin = false;
let watchlistIds = new Set(); // Track watchlist items

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
const watchlistLink = document.getElementById('watchlistLink');
const watchlistModal = document.getElementById('watchlistModal');
const watchlistGrid = document.getElementById('watchlistGrid');
const closeWatchlistBtn = document.getElementById('closeWatchlistBtn');
const adminLink = document.getElementById('adminLink');

// Auth DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authModalTitle = document.getElementById('authModalTitle');
const authCancelBtn = document.getElementById('authCancelBtn');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const userProfileConfig = document.getElementById('userProfileConfig');
const userNameDisplay = document.getElementById('userNameDisplay');
const userNameText = document.getElementById('userNameText');

// Profile DOM Elements
const profileModal = document.getElementById('profileModal');
const profileForm = document.getElementById('profileForm');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const profileNameInput = document.getElementById('profileName');
const profilePhoneInput = document.getElementById('profilePhone');
const profilePasswordInput = document.getElementById('profilePassword');

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();

    const path = window.location.pathname;

    if (path === '/watchlist') {
        loadWatchlistPage();
    } else if (path === '/' || path === '/index.html') {
        if (typeof fetchMovies === 'function') fetchMovies();
    }

    setupEventListeners();
    setupAuthListeners();
    setupProfileListeners();
});

function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            fetchMovies();
        }, 500));
    }

    if (genreSelect) genreSelect.addEventListener('change', fetchMovies);
    if (sortSelect) sortSelect.addEventListener('change', fetchMovies);
    if (yearSelect) yearSelect.addEventListener('change', fetchMovies);

    if (addMovieBtn) addMovieBtn.addEventListener('click', openAddModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (movieForm) movieForm.addEventListener('submit', handleFormSubmit);

    // Close modal when clicking outside
    if (movieModal) {
        movieModal.addEventListener('click', (e) => {
            if (e.target === movieModal) closeModal();
        });
    }
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
    if (!movieGrid) return; // Guard against missing element on other pages

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
        const posterUrl = movie.posterUrl || 'https://via.placeholder.com/320x400/6D8196/FFFFFF?text=No+Poster';
        const trailerUrl = movie.trailerUrl || '';

        card.innerHTML = `
            <img src="${posterUrl}" alt="${title}" class="movie-poster" onclick="openDetailModal('${movie._id}')" 
                 onmouseover="playTrailer(this, '${trailerUrl}')" 
                 onmouseout="stopTrailer(this, '${posterUrl}')">
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
            <div class="card-actions ${isLoggedIn ? '' : 'hidden'}">
                ${getMovieActions(movie)}
            </div>
        `;
        movieGrid.appendChild(card);
    });
}

function getMovieActions(movie) {
    if (!isLoggedIn) return '';

    const isInWatchlist = watchlistIds.has(movie._id);
    const watchlistBtnClass = isInWatchlist ? 'btn-delete' : 'btn-edit';
    const watchlistBtnText = isInWatchlist ? 'In Watchlist' : 'Watchlist';
    const watchlistBtnColor = isInWatchlist ? '#FBE408' : '#FBE408';
    const watchlistAction = isInWatchlist ? `removeFromWatchlist('${movie._id}')` : `addToWatchlist('${movie._id}')`;

    let buttons = '';

    if (isAdmin) {
        buttons += `
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
        `;
    } else {
        // Watchlist button only for non-admin users
        buttons += `
            <button class="${watchlistBtnClass}" onclick="${watchlistAction}" style="color: ${watchlistBtnColor}; border-color: ${watchlistBtnColor};">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="${isInWatchlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                ${watchlistBtnText}
            </button>
        `;
    }

    // Watch button (for ALL users including admins, if link exists)
    if (movie.movieLink) {
        buttons += `
            <a href="${movie.movieLink}" target="_blank" class="btn-watch">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Watch
            </a>
        `;
    }

    return buttons;
}



// Trailer hover functionality
let trailerTimeouts = new Map();

window.playTrailer = function (img, trailerUrl) {
    if (!trailerUrl) return;

    const timeout = setTimeout(() => {
        const videoId = extractYouTubeId(trailerUrl);
        if (videoId) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.allow = 'autoplay';

            img.style.position = 'relative';
            img.parentElement.style.position = 'relative';
            img.style.opacity = '0';
            img.parentElement.insertBefore(iframe, img.nextSibling);
        }
    }, 1000);

    trailerTimeouts.set(img, timeout);
};

window.stopTrailer = function (img, posterUrl) {
    const timeout = trailerTimeouts.get(img);
    if (timeout) {
        clearTimeout(timeout);
        trailerTimeouts.delete(img);
    }

    const iframe = img.parentElement.querySelector('iframe');
    if (iframe) {
        iframe.remove();
    }
    img.style.opacity = '1';
};

function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Open Detail Modal
window.openDetailModal = async function (id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch movie');

        const movie = await response.json();

        // Load reviews
        const reviewsData = await loadReviews(id);

        const detailModal = document.createElement('div');
        detailModal.className = 'modal active';
        detailModal.id = 'detailModal';

        const posterUrl = movie.posterUrl || 'https://via.placeholder.com/900x500/6D8196/FFFFFF?text=No+Poster';
        const trailerUrl = movie.trailerUrl || '';
        const videoId = extractYouTubeId(trailerUrl);

        detailModal.innerHTML = `
            <div class="detail-modal-content">
                ${videoId ? `
                    <div class="trailer-container">
                        <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                ` : `<img src="${posterUrl}" alt="${movie.title}" class="detail-poster">`}
                <div class="detail-content">
                    <div class="detail-header">
                        <h2 class="detail-title">${movie.title}</h2>
                        <button class="close-btn" onclick="closeDetailModal()">×</button>
                    </div>
                    <div class="detail-meta">
                        <span class="genre-tag">${movie.genre}</span>
                        <span class="year-badge">${movie.year}</span>
                        <span class="rating-tag">${movie.rating ? `${movie.rating}/10` : 'No Rating'}</span>
                    </div>
                    ${movie.director ? `<p><strong>Director:</strong> ${movie.director}</p>` : ''}
                    <p class="detail-description">${movie.description || 'No description available.'}</p>
                    
                    <div id="reviewsContainer"></div>
                </div>
            </div>
        `;

        document.body.appendChild(detailModal);
        document.body.style.overflow = 'hidden';

        // Add reviews section
        const reviewsContainer = detailModal.querySelector('#reviewsContainer');
        const reviewsSection = renderReviewsSection(id, reviewsData);
        reviewsContainer.appendChild(reviewsSection);

        // Setup review form if it exists
        const submitBtn = detailModal.querySelector('#submitReviewBtn');
        const ratingInput = detailModal.querySelector('#reviewRatingInput');

        if (submitBtn && ratingInput) {
            let selectedRating = 0;

            // Add interactive star rating
            const starRating = renderStarRating(0, true, (rating) => {
                selectedRating = rating;
            });
            ratingInput.appendChild(starRating);

            submitBtn.addEventListener('click', async () => {
                const comment = detailModal.querySelector('#reviewCommentInput').value;

                if (selectedRating === 0) {
                    showToast('Please select a rating', 'error');
                    return;
                }

                try {
                    await submitReview(id, selectedRating, comment);
                    closeDetailModal();
                    // Reopen to show new review
                    setTimeout(() => openDetailModal(id), 300);
                } catch (error) {
                    console.error('Submit review error:', error);
                }
            });
        }

        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) closeDetailModal();
        });
    } catch (error) {
        console.error('Error loading movie details:', error);
        showToast('Failed to load movie details', 'error');
    }
};

window.closeDetailModal = function () {
    const detailModal = document.getElementById('detailModal');
    if (detailModal) {
        detailModal.remove();
        document.body.style.overflow = 'auto';
    }
};

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
        document.getElementById('posterUrl').value = movie.posterUrl || '';
        document.getElementById('trailerUrl').value = movie.trailerUrl || '';
        document.getElementById('movieLink').value = movie.movieLink || '';

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
        description: document.getElementById('description').value.trim() || null,
        posterUrl: document.getElementById('posterUrl').value.trim() || null,
        posterUrl: document.getElementById('posterUrl').value.trim() || null,
        trailerUrl: document.getElementById('trailerUrl').value.trim() || null,
        movieLink: document.getElementById('movieLink').value.trim() || null
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

// --- Auth field errors (shown under inputs) ---
function clearAuthFieldErrors() {
    const ids = ['authNameError', 'authPhoneError', 'authEmailError', 'authPasswordError'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });

    const inputs = ['authName', 'authPhone', 'authEmail', 'authPassword'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.classList.remove('input-error');
    });
}

function setAuthFieldError(field, message) {
    const map = {
        name: { input: 'authName', error: 'authNameError' },
        phone: { input: 'authPhone', error: 'authPhoneError' },
        email: { input: 'authEmail', error: 'authEmailError' },
        password: { input: 'authPassword', error: 'authPasswordError' }
    };
    const target = map[field];
    if (!target) return;

    const errEl = document.getElementById(target.error);
    if (errEl) errEl.textContent = message;

    const inputEl = document.getElementById(target.input);
    if (inputEl) inputEl.classList.add('input-error');
}


// Loading State
function showLoading() {
    if (!movieGrid) return;
    movieGrid.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading movies...</p>
        </div>
    `;
}

// Auth Logic
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        isLoggedIn = data.isAuthenticated;
        currentUser = data.user;
        isAdmin = currentUser && currentUser.role === 'admin';

        if (isLoggedIn) {
            await fetchWatchlistIds();
        }

        updateAuthUI();
    } catch (error) {
        console.error('Auth check failed:', error);
        isLoggedIn = false;
        isAdmin = false;
        watchlistIds.clear();
        updateAuthUI();
    }
}

function updateAuthUI() {
    if (isLoggedIn) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden'); // Ensure logout is visible in the container
        if (userProfileConfig) userProfileConfig.classList.remove('hidden');
        if (userNameText && currentUser) userNameText.textContent = currentUser.name || currentUser.email || 'User';

        if (isAdmin) {
            if (addMovieBtn) addMovieBtn.classList.remove('hidden');
            if (adminLink) adminLink.classList.remove('hidden');
            if (watchlistLink) watchlistLink.classList.add('hidden'); // No watchlist link for admins
        } else {
            if (addMovieBtn) addMovieBtn.classList.add('hidden');
            if (adminLink) adminLink.classList.add('hidden');
            if (watchlistLink) watchlistLink.classList.remove('hidden'); // Show watchlist link for users
        }
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden'); // Hide if outside container, but mainly controlled by container visibility
        if (userProfileConfig) userProfileConfig.classList.add('hidden');

        if (addMovieBtn) addMovieBtn.classList.add('hidden');
        if (watchlistLink) watchlistLink.classList.add('hidden');
        if (adminLink) adminLink.classList.add('hidden');
    }
    // Re-render movies to show/hide edit/delete buttons
    if (typeof renderMovies === 'function' && currentMovies) {
        renderMovies(currentMovies);
    }
}

function setupAuthListeners() {
    loginBtn.addEventListener('click', () => openAuthModal('login'));
    registerBtn.addEventListener('click', () => openAuthModal('register'));
    logoutBtn.addEventListener('click', handleLogout);

    authCancelBtn.addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    tabLogin.addEventListener('click', () => switchAuthTab('login'));
    tabRegister.addEventListener('click', () => switchAuthTab('register'));

    authForm.addEventListener('submit', handleAuthSubmit);
}

let authMode = 'login';

function openAuthModal(mode) {
    authMode = mode;
    switchAuthTab(mode);
    authForm.reset();
    clearAuthFieldErrors();
    authModal.classList.add('active');
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Initial visibility set
    if (mode === 'login') {
        document.getElementById('authName').parentElement.style.display = 'none';
        document.getElementById('authPhone').parentElement.style.display = 'none';
    } else {
        document.getElementById('authName').parentElement.style.display = 'block';
        document.getElementById('authPhone').parentElement.style.display = 'block';
    }
}

function closeAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function switchAuthTab(mode) {
    authMode = mode;
    if (mode === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        authModalTitle.textContent = 'Login';
        authSubmitBtn.textContent = 'Login';
        document.getElementById('authName').parentElement.style.display = 'none';
        document.getElementById('authPhone').parentElement.style.display = 'none';
    } else {
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
        authModalTitle.textContent = 'Register';
        authSubmitBtn.textContent = 'Register';
        document.getElementById('authName').parentElement.style.display = 'block';
        document.getElementById('authPhone').parentElement.style.display = 'block';
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    clearAuthFieldErrors();

    const email = document.getElementById('authEmail')?.value || '';
    const password = document.getElementById('authPassword')?.value || '';
    const name = document.getElementById('authName')?.value || '';
    const phone = document.getElementById('authPhone')?.value || '';

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';

    const body = { email, password };
    if (authMode === 'register') {
        body.name = name;
        body.phone = phone;
    }

    // --- Client-side validation (so user gets instant feedback) ---
    const clientErrors = {};
    const cleanEmail = String(email || '').trim();
    const cleanPassword = String(password || '');
    const cleanName = String(name || '').trim();
    const cleanPhoneDigits = String(phone || '').replace(/\D/g, '');

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(cleanEmail);

    if (!cleanEmail) clientErrors.email = 'Email is required';
    else if (!emailOk) clientErrors.email = 'Please enter a valid email address';
    if (!cleanPassword) clientErrors.password = 'Password is required';
    else if (authMode === 'register' && cleanPassword.length < 6) clientErrors.password = 'Password must be at least 6 characters long';

    if (authMode === 'register') {
        if (!cleanName) clientErrors.name = 'Name is required';
        else {
            if (cleanName.length < 2 || cleanName.length > 50) clientErrors.name = 'Name must be 2–50 characters long';
            // Unicode letters (Latin/Cyrillic/Kazakh etc.)
            if (!/\p{L}/u.test(cleanName)) clientErrors.name = 'Name must contain at least one letter';
            if (/^\d+$/u.test(cleanName)) clientErrors.name = 'Name cannot consist of digits only';
        }

        if (String(phone || '').trim() !== '') {
            if (cleanPhoneDigits.length < 10 || cleanPhoneDigits.length > 15) {
                clientErrors.phone = 'Phone number must contain 10–15 digits';
            }
        }
    }

    if (Object.keys(clientErrors).length > 0) {
        Object.entries(clientErrors).forEach(([field, msg]) => setAuthFieldError(field, msg));
        showToast(Object.values(clientErrors)[0] || 'Validation failed', 'error');
        return;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // Show field errors (if provided)
            if (data && data.fieldErrors && typeof data.fieldErrors === 'object') {
                Object.entries(data.fieldErrors).forEach(([field, msg]) => {
                    setAuthFieldError(field, msg);
                });
                // also show a compact toast
                const firstMsg = Object.values(data.fieldErrors)[0];
                showToast(firstMsg || data.error || 'Validation failed', 'error');
                return;
            }
            throw new Error(data.error || 'Authentication failed');
        }

        showToast(data.message || 'Success!', 'success');
        closeAuthModal();
        await checkAuthStatus(); // Update UI state

    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleLogout() {
    if (!confirm('Are you sure you want to log out?')) return;

    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        showToast('Logged out successfully', 'info');
        // Clear localized user data
        isLoggedIn = false;
        currentUser = null;
        isAdmin = false;
        await checkAuthStatus();
        window.location.reload(); // Reload to refresh state cleanly
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Profile Logic
function setupProfileListeners() {
    if (userNameDisplay) {
        userNameDisplay.addEventListener('click', openProfileModal);
    }
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', closeProfileModal);
    }
    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) closeProfileModal();
        });
    }
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
}

function openProfileModal() {
    if (!currentUser) return;

    profileNameInput.value = currentUser.name || '';
    profilePhoneInput.value = currentUser.phone || '';
    profilePasswordInput.value = ''; // Don't show current password

    profileModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
    profileModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    profileForm.reset();
}

async function handleProfileSubmit(e) {
    e.preventDefault();

    const formData = {
        name: profileNameInput.value.trim(),
        phone: profilePhoneInput.value.trim(),
        password: profilePasswordInput.value
    };

    if (!formData.name) {
        showToast('Name is required', 'error');
        return;
    }

    try {
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update profile');
        }

        showToast('Profile updated successfully', 'success');
        closeProfileModal();
        await checkAuthStatus(); // Refresh user data
    } catch (error) {
        console.error('Profile update error:', error);
        showToast(error.message, 'error');
    }
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

// Watchlist Logic
function setupWatchlistListeners() {
    watchlistLink.addEventListener('click', (e) => {
        e.preventDefault();
        openWatchlistModal();
    });

    closeWatchlistBtn.addEventListener('click', () => {
        watchlistModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    watchlistModal.addEventListener('click', (e) => {
        if (e.target === watchlistModal) {
            watchlistModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

function openWatchlistModal() {
    watchlistModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadWatchlist();
}

async function loadWatchlist() {
    watchlistGrid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading watchlist...</p></div>';

    try {
        const response = await fetch('/api/watchlist');
        if (!response.ok) throw new Error('Failed to load watchlist');

        const movies = await response.json();
        renderWatchlist(movies);
    } catch (error) {
        console.error('Watchlist error:', error);
        watchlistGrid.innerHTML = '<p class="error-msg">Failed to load watchlist</p>';
    }
}

function renderWatchlist(movies) {
    watchlistGrid.innerHTML = '';

    if (movies.length === 0) {
        watchlistGrid.innerHTML = '<p class="no-results">Your watchlist is empty.</p>';
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        // Reuse movie card style but simpler actions
        card.innerHTML = `
            <img src="${movie.posterUrl || 'https://via.placeholder.com/320x400'}" alt="${movie.title}" class="movie-poster" style="height: 300px;">
            <div class="card-content">
                <h3 class="movie-title" style="font-size: 1.2rem;">${movie.title}</h3>
                <p class="movie-meta">${movie.year}</p>
            </div>
            <div class="card-actions">
                <button class="btn-delete" onclick="removeFromWatchlist('${movie._id}')">
                    Remove
                </button>
            </div>
        `;
        watchlistGrid.appendChild(card);
    });
}

window.addToWatchlist = async (movieId) => {
    try {
        const response = await fetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId })
        });

        const data = await response.json();
        if (response.ok) {
            showToast('Added to watchlist', 'success');
            watchlistIds.add(movieId);
            renderMovies(currentMovies); // Re-render to update UI
        } else {
            showToast(data.error || 'Failed to add', 'error');
        }
    } catch (error) {
        showToast('Error adding to watchlist', 'error');
    }
};

window.removeFromWatchlist = async (movieId) => {
    try {
        const response = await fetch(`/api/watchlist/${movieId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Removed from watchlist', 'success');
            watchlistIds.delete(movieId);
            renderMovies(currentMovies); // Re-render to update UI

            // If modal is open, reload it too
            if (watchlistModal.classList.contains('active')) {
                loadWatchlist();
            }
        } else {
            showToast('Failed to remove', 'error');
        }
    } catch (error) {
        showToast('Error removing', 'error');
    }
};

// Fetch Watchlist IDs for UI state
async function fetchWatchlistIds() {
    try {
        const response = await fetch('/api/watchlist');
        if (response.ok) {
            const movies = await response.json();
            watchlistIds = new Set(movies.map(m => m._id));
            renderMovies(currentMovies); // Re-render to update buttons
        }
    } catch (error) {
        console.error('Failed to fetch watchlist IDs', error);
    }
}

// Watchlist Page Logic
async function loadWatchlistPage() {
    const grid = document.getElementById('watchlistPageGrid');
    if (!grid) {
        console.error('Watchlist grid not found');
        return;
    }

    try {
        const response = await fetch('/api/watchlist');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to load watchlist: ${response.status} ${errorText}`);
        }

        const movies = await response.json();
        renderWatchlistPage(movies);
    } catch (error) {
        console.error('Watchlist page error:', error);
        grid.innerHTML = `<div class="no-results"><p class="error-msg">Error: ${error.message}</p></div>`;
    }
}

function renderWatchlistPage(movies) {
    const grid = document.getElementById('watchlistPageGrid');
    grid.innerHTML = '';

    if (movies.length === 0) {
        grid.innerHTML = '<div class="no-results"><h3>Your watchlist is empty</h3><a href="/" class="btn-primary" style="margin-top: 1rem;">Discover Movies</a></div>';
        return;
    }

    // Reuse render logic or duplicate with remove button
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        const title = movie.title || 'Untitled';
        const year = movie.year || 'N/A';
        const rating = movie.rating ? `${movie.rating}/10` : 'No Rating';
        const posterUrl = movie.posterUrl || 'https://via.placeholder.com/320x400';

        card.innerHTML = `
            <img src="${posterUrl}" alt="${title}" class="movie-poster" onclick="openDetailModal('${movie._id}')">
            <div class="card-content">
                <div class="card-header">
                    <span class="genre-tag">${movie.genre || 'Genre'}</span>
                    <span class="rating-tag">${rating}</span>
                </div>
                <h3 class="movie-title">${title}</h3>
                <p class="movie-meta"><span class="year-badge">${year}</span></p>
                <p class="movie-desc">${movie.description || ''}</p>
            </div>
            <div class="card-actions">
                <button class="btn-delete" onclick="removeFromWatchlist('${movie._id}')">Remove</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Override removeFromWatchlist to handle page refresh
const originalRemove = window.removeFromWatchlist;
window.removeFromWatchlist = async (movieId) => {
    if (window.location.pathname === '/watchlist') {
        try {
            const response = await fetch(`/api/watchlist/${movieId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                showToast('Removed from watchlist', 'success');
                loadWatchlistPage(); // Reload page content
            }
        } catch (error) {
            showToast('Error removing', 'error');
        }
    } else {
        // Use original logic for home page
        try {
            const response = await fetch(`/api/watchlist/${movieId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Removed from watchlist', 'success');
                watchlistIds.delete(movieId);
                renderMovies(currentMovies);
            }
        } catch (error) {
            showToast('Error removing', 'error');
        }
    }
};

// ============================================
// REVIEW SYSTEM
// ============================================

// Render star rating (interactive or read-only)
function renderStarRating(rating, interactive = false, onRatingChange = null) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rating;
        const starClass = interactive ? 'star interactive' : 'star';
        const fillColor = filled ? 'currentColor' : 'none';

        stars.push(`
            <svg class="${starClass}" data-rating="${i}" width="24" height="24" viewBox="0 0 24 24" 
                 fill="${fillColor}" stroke="currentColor" stroke-width="2"
                 ${interactive ? `style="cursor: pointer;"` : ''}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        `);
    }

    const container = document.createElement('div');
    container.className = 'star-rating';
    container.innerHTML = stars.join('');

    if (interactive && onRatingChange) {
        const starElements = container.querySelectorAll('.star');
        let currentRating = rating;

        starElements.forEach(star => {
            star.addEventListener('mouseenter', (e) => {
                const hoverRating = parseInt(e.currentTarget.dataset.rating);
                updateStarDisplay(starElements, hoverRating);
            });

            star.addEventListener('click', (e) => {
                currentRating = parseInt(e.currentTarget.dataset.rating);
                onRatingChange(currentRating);
            });
        });

        container.addEventListener('mouseleave', () => {
            updateStarDisplay(starElements, currentRating);
        });
    }

    return container;
}

function updateStarDisplay(starElements, rating) {
    starElements.forEach((star, index) => {
        const polygon = star.querySelector('polygon');
        if (index < rating) {
            polygon.setAttribute('fill', 'currentColor');
        } else {
            polygon.setAttribute('fill', 'none');
        }
    });
}

// Load reviews for a movie
async function loadReviews(movieId) {
    try {
        const response = await fetch(`/api/reviews/${movieId}`);
        if (!response.ok) throw new Error('Failed to load reviews');

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Load reviews error:', error);
        return { reviews: [], averageRating: 0, reviewCount: 0 };
    }
}

// Submit a new review
async function submitReview(movieId, rating, comment) {
    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId, rating, comment })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit review');
        }

        showToast('Review submitted successfully!', 'success');
        return data;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

// Update an existing review
async function updateReview(reviewId, rating, comment) {
    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, comment })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update review');
        }

        showToast('Review updated successfully!', 'success');
        return data;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

// Delete a review
async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete your review?')) return false;

    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete review');
        }

        showToast('Review deleted successfully', 'success');
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    }
}

// Render reviews section
function renderReviewsSection(movieId, reviewsData) {
    const { reviews, averageRating, reviewCount } = reviewsData;
    const userId = currentUser?._id?.toString();
    const userReview = reviews.find(r => r.userId.toString() === userId);
    const otherReviews = reviews.filter(r => r.userId.toString() !== userId);

    const section = document.createElement('div');
    section.className = 'reviews-section';
    section.id = 'reviewsSection';

    // Average rating display
    const avgRatingHTML = reviewCount > 0 ? `
        <div class="average-rating">
            <div class="avg-rating-number">${averageRating.toFixed(1)}</div>
            <div class="avg-rating-stars">
                ${renderStarRating(Math.round(averageRating)).outerHTML}
            </div>
            <div class="review-count">${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}</div>
        </div>
    ` : '<div class="average-rating"><p>No reviews yet. Be the first to review!</p></div>';

    // Review form (if logged in and no existing review)
    let reviewFormHTML = '';
    if (isLoggedIn && !userReview) {
        reviewFormHTML = `
            <div class="review-form">
                <h3>Write a Review</h3>
                <div class="form-group">
                    <label>Your Rating</label>
                    <div id="reviewRatingInput"></div>
                </div>
                <div class="form-group">
                    <label>Your Review</label>
                    <textarea id="reviewCommentInput" rows="4" placeholder="Share your thoughts about this movie..."></textarea>
                </div>
                <button class="btn-primary" id="submitReviewBtn">Submit Review</button>
            </div>
        `;
    } else if (!isLoggedIn) {
        reviewFormHTML = '<p class="login-prompt">Please <a href="#" onclick="openAuthModal(\'login\'); return false;">login</a> to write a review.</p>';
    }

    // User's existing review (if any)
    let userReviewHTML = '';
    if (userReview) {
        userReviewHTML = `
            <div class="user-review">
                <h3>Your Review</h3>
                <div class="review-card own-review" id="userReview-${userReview._id}">
                    <div class="review-header">
                        <div class="review-author">${userReview.user.email}</div>
                        <div class="review-rating">${renderStarRating(userReview.rating).outerHTML}</div>
                    </div>
                    <p class="review-comment">${userReview.comment || '<em>No comment</em>'}</p>
                    <div class="review-date">${new Date(userReview.createdAt).toLocaleDateString()}</div>
                    <div class="review-actions">
                        <button class="btn-edit" onclick="editReviewInline('${userReview._id}', ${userReview.rating}, '${escapeHtml(userReview.comment)}')">Edit</button>
                        <button class="btn-delete" onclick="deleteReviewAndRefresh('${userReview._id}', '${movieId}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Other reviews
    let otherReviewsHTML = '';
    if (otherReviews.length > 0) {
        otherReviewsHTML = `
            <div class="other-reviews">
                <h3>Reviews (${otherReviews.length})</h3>
                ${otherReviews.map(review => `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="review-author">${review.user.email}</div>
                            <div class="review-rating">${renderStarRating(review.rating).outerHTML}</div>
                        </div>
                        <p class="review-comment">${review.comment || '<em>No comment</em>'}</p>
                        <div class="review-date">${new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    section.innerHTML = `
        <h2>Reviews & Ratings</h2>
        ${avgRatingHTML}
        ${userReviewHTML}
        ${reviewFormHTML}
        ${otherReviewsHTML}
    `;

    return section;
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Edit review inline
window.editReviewInline = function (reviewId, currentRating, currentComment) {
    const reviewCard = document.getElementById(`userReview-${reviewId}`);
    if (!reviewCard) return;

    let selectedRating = currentRating;

    reviewCard.innerHTML = `
        <div class="review-edit-form">
            <h4>Edit Your Review</h4>
            <div class="form-group">
                <label>Rating</label>
                <div id="editRatingInput-${reviewId}"></div>
            </div>
            <div class="form-group">
                <label>Comment</label>
                <textarea id="editCommentInput-${reviewId}" rows="4">${currentComment}</textarea>
            </div>
            <div class="review-actions">
                <button class="btn-primary" onclick="saveReviewEdit('${reviewId}')">Save</button>
                <button class="btn-secondary" onclick="location.reload()">Cancel</button>
            </div>
        </div>
    `;

    // Add interactive star rating
    const ratingContainer = document.getElementById(`editRatingInput-${reviewId}`);
    const starRating = renderStarRating(currentRating, true, (rating) => {
        selectedRating = rating;
    });
    ratingContainer.appendChild(starRating);

    // Store selected rating for save function
    window[`editRating_${reviewId}`] = selectedRating;
};

// Save review edit
window.saveReviewEdit = async function (reviewId) {
    const rating = window[`editRating_${reviewId}`];
    const comment = document.getElementById(`editCommentInput-${reviewId}`).value;

    try {
        await updateReview(reviewId, rating, comment);
        location.reload(); // Refresh to show updated review
    } catch (error) {
        console.error('Failed to save review edit:', error);
    }
};

// Delete review and refresh
window.deleteReviewAndRefresh = async function (reviewId, movieId) {
    const success = await deleteReview(reviewId);
    if (success) {
        location.reload(); // Refresh to remove review
    }
};