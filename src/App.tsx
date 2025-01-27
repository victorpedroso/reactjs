import Search from "./components/Search.tsx";
import {useState, useEffect} from "react";
import Spinner from "./components/Spinner.tsx";
import MovieCard, {Movie} from "./components/MovieCard.tsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.ts";
import {Models} from "appwrite";

type AppwriteDocument = Models.Document;

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: "GET",
    headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_KEY}`
    }
}


function App() {
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [moviesList, setMoviesList] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [trendingMovies, setTrendingMovies] = useState<AppwriteDocument[]>([]);

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

    const fetchMovies = async (query: string = "") => {
        setLoading(true);
        setErrorMessage("");
        try {
            const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURI(query)}` :
                `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error("Falha ao obter lista de filmes");
            }

            const data = await response.json();

            if (data.Response === "False") {
                setErrorMessage(data.Error || "Falha ao obter lista de filmes")
                setMoviesList([]);
                return;
            }

            setMoviesList(data.results || []);

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }

        }
        catch (error: any) {
            console.log(error);
            setErrorMessage(error.message);
        }
        finally {
            setLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();

            setTrendingMovies(movies || []);

        } catch (error) {
            console.log(error);
        }

    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);


  return (
      <main>
          <div className="pattern"/>
             <div className="wrapper">
                 <header>
                     <img src={"./hero.png"} alt="Hero Banner"/>
                     <h1>Encontre <span className="text-gradient">filmes</span> que você vai gostar sem complicações</h1>
                     <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                 </header>

                 {trendingMovies.length > 0 && (
                     <section className="trending">
                         <h2>Filmes em alta</h2>
                         <ul>
                             {trendingMovies.map((movie, index) => (
                                 <li key={movie.$id}>
                                     <p>{index + 1}</p>
                                     <img src={movie.poster_url} alt={movie.title}/>
                                 </li>
                             ))}
                         </ul>
                     </section>
                 )}

                 <section className="all-movies">
                     <h2>Todos os filmes</h2>
                     {loading ? (
                         <Spinner />
                     ) : errorMessage ? (
                         <p className="text-red-500">{errorMessage}</p>
                     ) : (
                         <ul>
                             {moviesList.map((movie: Movie) => (
                                 <MovieCard key={movie.id} movie={movie} />
                             ))}
                         </ul>
                     )}
                 </section>


             </div>
      </main>
  )
}

export default App
