// API Configuration
const API_KEY = '7de31911';
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&`;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const moviesContainer = document.getElementById('moviesContainer');
const favoritesContainer = document.getElementById('favoritesContainer');
const favoritesButton = document.getElementById('favoritesButton');
const backToSearch = document.getElementById('backToSearch');
const searchResults = document.getElementById('searchResults');
const favoritesSection = document.getElementById('favoritesSection');
const noResults = document.getElementById('noResults');
const noFavorites = document.getElementById('noFavorites');
const movieModal = document.getElementById('movieModal');
const closeModal = document.getElementById('closeModal');
const modalAddFavorite = document.getElementById('modalAddFavorite');
const modalRemoveFavorite = document.getElementById('modalRemoveFavorite');

// Modal Elements
const modalTitle = document.getElementById('modalTitle');
const modalPoster = document.getElementById('modalPoster');
const modalYear = document.getElementById('modalYear');
const modalRated = document.getElementById('modalRated');
const modalRuntime = document.getElementById('modalRuntime');
const modalRating = document.getElementById('modalRating');
const ratingBar = document.getElementById('ratingBar');
const modalGenre = document.getElementById('modalGenre');
const modalDirector = document.getElementById('modalDirector');
const modalActors = document.getElementById('modalActors');
const modalPlot = document.getElementById('modalPlot');

// State
let currentMovie = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Event Listeners
searchButton.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

favoritesButton.addEventListener('click', showFavorites);
backToSearch.addEventListener('click', showSearchResults);
closeModal.addEventListener('click', () => {
    movieModal.classList.add('hidden');
});

modalAddFavorite.addEventListener('click', addToFavorites);
modalRemoveFavorite.addEventListener('click', removeFromFavorites);

// Functions
async function searchMovies() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        alert('Lütfen bir film veya dizi adı girin');
        return;
    }

    try {
        const response = await fetch(`${API_URL}s=${encodeURIComponent(searchTerm)}&type=movie`);
        const data = await response.json();

        if (data.Response === 'True') {
            displayMovies(data.Search);
        } else {
            moviesContainer.innerHTML = '';
            noResults.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Hata:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

function displayMovies(movies) {
    moviesContainer.innerHTML = '';
    noResults.classList.add('hidden');

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
            <div class="movie-card-info">
                <h3>${movie.Title}</h3>
                <p><i class="fas fa-calendar"></i> ${movie.Year}</p>
                <p><i class="fas fa-film"></i> ${movie.Type}</p>
            </div>
        `;

        movieCard.addEventListener('click', () => {
            getMovieDetails(movie.imdbID);
        });

        moviesContainer.appendChild(movieCard);
    });
}

async function getMovieDetails(imdbID) {
    try {
        const response = await fetch(`${API_URL}i=${imdbID}&plot=full`);
        const data = await response.json();

        if (data.Response === 'True') {
            currentMovie = data;
            showMovieModal(data);
        } else {
            alert('Film detayları alınamadı.');
        }
    } catch (error) {
        console.error('Hata:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

function showMovieModal(movie) {
    modalTitle.textContent = movie.Title;
    modalPoster.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image';
    modalYear.textContent = movie.Year;
    modalRated.textContent = movie.Rated;
    modalRuntime.textContent = movie.Runtime;
    modalRating.textContent = movie.imdbRating;
    modalGenre.textContent = movie.Genre;
    modalDirector.textContent = movie.Director;
    modalActors.textContent = movie.Actors;
    modalPlot.textContent = movie.Plot;

    const ratingPercent = (parseFloat(movie.imdbRating) / 10) * 100;
    ratingBar.style.width = `${ratingPercent}%`;

    const isFavorite = favorites.some(fav => fav.imdbID === movie.imdbID);
    if (isFavorite) {
        modalAddFavorite.classList.add('hidden');
        modalRemoveFavorite.classList.remove('hidden');
    } else {
        modalAddFavorite.classList.remove('hidden');
        modalRemoveFavorite.classList.add('hidden');
    }

    movieModal.classList.remove('hidden');
}

function addToFavorites() {
    if (currentMovie && !favorites.some(fav => fav.imdbID === currentMovie.imdbID)) {
        favorites.push(currentMovie);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        modalAddFavorite.classList.add('hidden');
        modalRemoveFavorite.classList.remove('hidden');
        
        showNotification('Film favorilere eklendi!');
    }
}

function removeFromFavorites() {
    if (currentMovie) {
        favorites = favorites.filter(fav => fav.imdbID !== currentMovie.imdbID);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        modalAddFavorite.classList.remove('hidden');
        modalRemoveFavorite.classList.add('hidden');
        
        showNotification('Film favorilerden çıkarıldı!');
        
        if (!favoritesSection.classList.contains('hidden')) {
            displayFavorites();
        }
    }
}

function showFavorites() {
    searchResults.classList.add('hidden');
    favoritesSection.classList.remove('hidden');
    displayFavorites();
}

function showSearchResults() {
    favoritesSection.classList.add('hidden');
    searchResults.classList.remove('hidden');
}

function displayFavorites() {
    favoritesContainer.innerHTML = '';
    
    if (favorites.length === 0) {
        noFavorites.classList.remove('hidden');
    } else {
        noFavorites.classList.add('hidden');
        
        favorites.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
                <div class="movie-card-info">
                    <h3>${movie.Title}</h3>
                    <p><i class="fas fa-calendar"></i> ${movie.Year}</p>
                    <p><i class="fas fa-star favorite-icon"></i> ${movie.imdbRating}</p>
                </div>
            `;

            movieCard.addEventListener('click', () => {
                getMovieDetails(movie.imdbID);
            });

            favoritesContainer.appendChild(movieCard);
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}