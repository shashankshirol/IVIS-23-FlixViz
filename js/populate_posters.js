function addCards(df, div_id) {
    for (let i = 0; i < df.shape[0]; i++){
        let title = {}
        title.name = df.iloc({ rows: [i] })["title"].values[0];
        title.img = df.iloc({ rows: [i] })["img"].values[0];
        title.vtype = df.iloc({ rows: [i] })["vtype"].values[0];
        title.nfid = df.iloc({ rows: [i] })["nfid"].values[0];
        title.genre = df.iloc({ rows: [i] })["genre"].values[0];
        title.synopsis = df.iloc({ rows: [i] })["synopsis"].values[0];
        title.year = df.iloc({ rows: [i] })["year"].values[0];
        title.imdbid = df.iloc({ rows: [i] })["imdbid"].values[0];
        title.imdb_rating = df.iloc({ rows: [i] })["imdb_rating"].values[0];

        $(div_id).append(`
        <div class="wrap">
        <img src="${title.img}" alt="${title.name}_poster" class="row_poster" />
        <div class="poster_info">
            <div class="poster_text">
                <h6>${title.name}</h6>
                <p>${title.synopsis.length > 100? title.synopsis.slice(0, 100) + "..." : title.synopsis}</p>
                <a href="https://www.netflix.com/title/${title.nfid}" target="_blank">Netflix</a>
                <a href=${(title.imdbid == null || title.imdbid.includes("|")) ? "https://www.imdb.com/find/?q=" + encodeURIComponent(title.name) : "https://www.imdb.com/title/" + title.imdbid} target="_blank" id="imdb_link">IMDB</a>
            </div>
        </div>
      </div>
        `);

    }
}

function emptyTopTitlescontainers() {
    d3.select("#movies-header").html("")
    d3.select("#MoviesDiv").html("")
    d3.select("#series-header").html("")
    d3.select("#SeriesDiv").html("")
}

function fillTopTitles(data, country) {
    emptyTopTitlescontainers()

    df = new dfd.DataFrame(data)

    let filtered_movies = df.iloc(
        { rows: df["vtype"].str.includes("movie") }
    )
    let movie_row_size = filtered_movies.shape[0] > 50 ? 10 : filtered_movies.shape[0]

    let filtered_series = df.iloc(
        { rows: df["vtype"].str.includes("series") }
    )
    let series_row_size = filtered_series.shape[0] > 50 ? 10 : filtered_series.shape[0]

    if (movie_row_size > 0) {
        $("#movies-header").text(`Top Movies available in ${country}`)
        filtered_movies = filtered_movies.sortValues(
            "imdb_rating", { ascending: false }
        )
        addCards(filtered_movies.head(movie_row_size), MoviesDiv)
    }

    if (series_row_size) {
        $("#series-header").text(`Top Series available in ${country}`)
        filtered_series = filtered_series.sortValues(
            "imdb_rating", { ascending: false }
        )
        addCards(filtered_series.head(series_row_size), SeriesDiv)
    }
}