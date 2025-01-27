interface SearchProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}

const Search = ({searchTerm, setSearchTerm} : SearchProps) => {
    return (
        <div className="search">
            <div>
                <img src={"./search.svg"} alt="Search"/>
                <input
                    type="text"
                    placeholder="Pesquise entre milhares de filmes"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    )
}
export default Search
