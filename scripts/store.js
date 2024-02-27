function setCurrentMovieId(id) {
    localStorage.setItem('currentMovie', JSON.stringify(id));
}

function getCurrentMovieId() {
    return JSON.parse(localStorage.getItem('currentMovie') || []);
}

export default { setCurrentMovieId, getCurrentMovieId }