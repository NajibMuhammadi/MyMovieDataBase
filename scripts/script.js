'use strict';
import api from './api.js';
import locarlStore from './store.js';

window.addEventListener('load', () => {
    console.log('load');
    if (document.title === 'My Movie Database') {
        setupCarousel();
        document.querySelector('#searchBtn').addEventListener('click', updateAutoCompleteList);
        document.querySelector('#favBtn').addEventListener('click', () => {
            getMovieFromLocal();
            clearSearchResults();
        });

    } else if (document.title === 'Movie') {
        const movieId = locarlStore.getCurrentMovieId();
        console.log(movieId);
        movieDetails(movieId);
    };
});

//Denna funktion skapar funktionalitet för karusellen
function setupCarousel() {
    console.log('carousel');
    const buttons = document.querySelectorAll('[data-carousel-btn]');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const offset = btn.dataset.carouselBtn === 'next' ? 1 : -1;
            const slides = btn.closest('[data-carousel').querySelector('[data-slides');
            const activeSlide = slides.querySelector('[data-active]');
            let newIndex = [...slides.children].indexOf(activeSlide) + offset;

            if (newIndex < 0) {
                newIndex = slides.children.length - 1;
            } else if (newIndex >= slides.children.length) {
                newIndex = 0;
            }

            slides.children[newIndex].dataset.active = true;
            delete activeSlide.dataset.active;
        });
    });
}

async function updateAutoCompleteList(event) {
    event.preventDefault();
    const userInput = document.querySelector('#searchInput').value.toLowerCase();
    console.log(userInput);
    await fetchData(userInput);
}
async function fetchData(userInput) {
    try {
        const apiUrl = `http://www.omdbapi.com/?apikey=e2c38983&s=${userInput}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('Fetch-svar:', data);
        if (data.Search) {
            document.querySelector('.d-none').classList.remove('d-none');
            const resultsList = document.querySelector('.results');
            resultsList.innerHTML = '';
            if (resultsList) {
                data.Search.forEach(movie => {
                    const searchCard = document.createElement('div');
                    searchCard.classList.add('search__card');
                    const searchTitle = document.createElement('h3');
                    searchTitle.textContent = movie.Title;
                    searchTitle.classList.add('search__card-subtitle');

                    const searchPosterContainer = document.createElement('div');
                    searchPosterContainer.classList.add('search__poster-container');

                    const searchPoster = document.createElement('img');
                    searchPoster.classList.add('search__card-img');
                    searchPoster.src = movie.Poster;
                    searchPoster.alt = movie.Title;
                    searchPosterContainer.appendChild(searchPoster);

                    const movieAddToFav = document.createElement('span');
                    movieAddToFav.textContent = '\u2605';
                    movieAddToFav.classList.add('search__poster-fav');
                    const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
                    const isMovieInFavorites = favoriteMovies.some(favMovie => favMovie.imdbID === movie.imdbID);
                    if (isMovieInFavorites) {
                        movieAddToFav.style.color = 'gold';
                    }
                    movieAddToFav.addEventListener('click', () => {

                        const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
                        const movieData = {
                            title: movie.Title,
                            poster: movie.Poster,
                            imdbID: movie.imdbID
                        };
                        const existingMovieIndex = favoriteMovies.findIndex(favMovie => favMovie.imdbID === movie.imdbID);
                        if (existingMovieIndex === -1) {
                            favoriteMovies.push(movieData);
                            localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
                            console.log('Film tillagd i favoriter:', movieData);
                            movieAddToFav.style.color = 'gold';
                        } else {
                            favoriteMovies.splice(existingMovieIndex, 1);
                            localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
                            console.log('Film borttagen från favoriter:', movieData);
                            movieAddToFav.style.color = 'white';
                        }
                    });
                    searchPosterContainer.appendChild(movieAddToFav);
                    searchPoster.addEventListener('click', () => {
                        locarlStore.setCurrentMovieId(movie.imdbID);
                        window.location.href = 'movie.html';
                    });
                    searchCard.appendChild(searchTitle);
                    searchCard.appendChild(searchPosterContainer);
                    resultsList.appendChild(searchCard);
                });
                document.querySelector('.d-none').classList.remove('d-none');
                document.querySelector('.popular').classList.add('d-none');
                document.querySelector('.carousel').classList.add('d-none');
            }
        } else {
            console.log('Inga resultat hittades');
        }
    }
    catch (error) {
        console.log('error', error);
    }
}


async function fetchMovieRandom() {
    const movieLink = 'https://santosnr6.github.io/Data/movies.json'
    try {
        const movies = await api.fetchMovies(movieLink);
        const randomMovies = [];
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * movies.length);
            randomMovies.push(movies[randomIndex]);
        }

        const slidesContainer = document.querySelector('[data-slides]');
        let firstSlide = true;
        if (slidesContainer) {
            randomMovies.forEach(movie => {
                const slide = document.createElement('li');
                slide.classList.add('carousel__slide');
                slide.style.listStyle = 'none';
                const iframe = document.createElement('iframe');
                iframe.src = movie.trailer_link;
                iframe.width = 420;
                iframe.height = 315;
                iframe.frameBorder = 0;
                slide.appendChild(iframe);
                if (firstSlide) {
                    slide.dataset.active = true;
                    firstSlide = false;
                }
                console.log(slidesContainer, slide);
                slidesContainer.appendChild(slide);
            });
        }

    }
    catch (error) {
        console.log('error', error);
    }
}
fetchMovieRandom();

async function fetchTopMovies() {
    const movieLink = 'https://santosnr6.github.io/Data/movies.json'
    try {
        const movies = await api.fetchMovies(movieLink);
        const topMovies = movies.slice(0, 20);
        renderTopMovies(topMovies);
    } catch (error) {
        console.log('error', error);
    }
}
fetchTopMovies();



function renderTopMovies(topMovies) {
    const cardContainer = document.querySelector('#popularCardContainer');
    if (cardContainer) {
        topMovies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('popular__card');
            const movieTitle = document.createElement('h2');
            movieTitle.textContent = movie.title;
            movieTitle.classList.add('popular__card-subtitle');
            const moviePoster = document.createElement('img');
            moviePoster.classList.add('popular__card-img');
            moviePoster.src = movie.poster;
            moviePoster.alt = movie.title;
            moviePoster.dataset.id = movie.imdbid;
            moviePoster.addEventListener('click', (event) => {
                locarlStore.setCurrentMovieId(event.target.dataset.id);
                window.location.href = 'movie.html';
            });
            movieCard.appendChild(movieTitle);
            movieCard.appendChild(moviePoster);
            cardContainer.appendChild(movieCard);
        });
    }

}

async function movieDetails(movieId) {
    try {
        const apiUrl = `http://www.omdbapi.com/?apikey=e2c38983&plot=full&i=${movieId}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data);
        if (data.Response === "True") {
            const movieDetailsContainer = document.querySelector('#movieDetails');
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie__details');

            const movieTextContainer = document.createElement('div');
            movieTextContainer.classList.add('movie__text-container');

            const movieTitle = document.createElement('h1');
            movieTitle.textContent = data.Title;
            movieTextContainer.appendChild(movieTitle);

            const movieRating = document.createElement('p');
            movieRating.textContent = 'Imdb Raing: ' + data.Ratings[0].Value;
            movieTextContainer.appendChild(movieRating);

            const moviePosterAndPlot = document.createElement('div');
            moviePosterAndPlot.classList.add('movie__poster-plot');

            const moviePoster = document.createElement('img');
            moviePoster.classList.add('movie__poster');
            moviePoster.src = data.Poster;
            moviePoster.alt = data.Title;
            moviePosterAndPlot.appendChild(moviePoster);

            const moviePlot = document.createElement('p');
            moviePlot.textContent = data.Plot;
            moviePlot.classList.add('movie__plot');
            moviePosterAndPlot.appendChild(moviePlot);

            const movieActorTitle = document.createElement('h2');
            movieActorTitle.textContent = 'Actors: ';
            movieActorTitle.classList.add('movie__actor-title');

            const movieActor = document.createElement('p');
            movieActor.textContent = data.Actors;
            movieActor.classList.add('movie__actor-subtitle');

            const movieDirectorTitle = document.createElement('h2');
            movieDirectorTitle.textContent = 'Director: ';
            movieDirectorTitle.classList.add('movie__actor-title');

            const movieDirector = document.createElement('p');
            movieDirector.textContent = data.Director;
            movieDirector.classList.add('movie__actor-subtitle');

            const movieGenreTitle = document.createElement('h2');
            movieGenreTitle.textContent = 'Genre: ';
            movieGenreTitle.classList.add('movie__actor-title');

            const movieGenre = document.createElement('p');
            movieGenre.textContent = data.Genre;
            movieGenre.classList.add('movie__actor-subtitle');

            movieCard.appendChild(movieTextContainer);
            movieCard.appendChild(moviePosterAndPlot);
            movieCard.appendChild(movieActorTitle);
            movieCard.appendChild(movieActor);
            movieCard.appendChild(movieDirectorTitle);
            movieCard.appendChild(movieDirector);
            movieCard.appendChild(movieGenreTitle);
            movieCard.appendChild(movieGenre);
            movieDetailsContainer.appendChild(movieCard);
        } else {
            console.log("Movie not found!");
        }

    }
    catch (error) {
        console.log('error', error);
    }

}
function getMovieFromLocal() {
    const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
    if (favoriteMovies.length > 0) {
        const favoritesContainer = document.querySelector('#favorites');
        favoritesContainer.innerHTML = '';
        favoriteMovies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('favorite__card');

            const movieTitle = document.createElement('h3');
            movieTitle.textContent = movie.title;
            movieTitle.classList.add('favorite__card-subtitle');

            const searchPosterContainer = document.createElement('div');
            searchPosterContainer.classList.add('favorite__card-container');

            const moviePoster = document.createElement('img');
            moviePoster.classList.add('favorite__card-img');
            moviePoster.src = movie.poster;
            moviePoster.alt = movie.title;
            searchPosterContainer.appendChild(moviePoster);

            const movieAddToFav = document.createElement('span');
            movieAddToFav.textContent = '\u2605';
            movieAddToFav.classList.add('favrotie__poster-fav');
            searchPosterContainer.appendChild(movieAddToFav);
            movieAddToFav.style.color = 'gold';
            movieAddToFav.addEventListener('click', () => {
                const existingMovieIndex = favoriteMovies.findIndex(favMovie => favMovie.imdbID === movie.imdbID);
                if (existingMovieIndex === -1) {
                } else {
                    favoriteMovies.splice(existingMovieIndex, 1);
                    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
                    movieAddToFav.style.color = 'white';
                }
            });

            movieCard.appendChild(movieTitle);
            movieCard.appendChild(searchPosterContainer);
            favoritesContainer.appendChild(movieCard);
        });

        const favoritesContainerElement = document.querySelector('#favoritesContainer');
        favoritesContainerElement.classList.remove('d-none');
        document.querySelector('.popular').classList.add('d-none');
        document.querySelector('.carousel').classList.add('d-none');

    }
}

function clearSearchResults() {
    const resultsList = document.querySelector('#displayNone');
    resultsList.innerHTML = '';
    resultsList.classList.add('d-none');
}