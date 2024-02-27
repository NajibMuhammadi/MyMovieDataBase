async function fetchMovies(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error:', error);
        return [];
    }
}
export default { fetchMovies }


