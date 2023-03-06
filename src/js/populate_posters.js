async function getJSON(path) {
    return await fetch(path).then(response => response.json());
}

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
        <div class="card mx-auto" style="width: 15em">
        <img src="${title.img}" class="card-img-top" alt="...">
        <div class="card-body">
          <h5 class="card-title">${title.name} (IMDB: ${title.imdb_rating})</h5>
          <p class="card-text">${title.synopsis.slice(0, 140)}${title.synopsis.length > 50 ? "...":""}</p>
          <a href="https://www.netflix.com/title/${title.nfid}" class="btn btn-primary" target="_blank">Netflix</a>
          <a href="https://www.imdb.com/title/${title.imdbid}" class="btn btn-primary" target="_blank">IMDB</a>
        </div>
      </div>
        `);

    }
}

getJSON("../Data/data_netflix.json").then(data => {
    const country = "Italy"
    df = new dfd.DataFrame(data)

    let filtered_top5_movies = df.iloc(
        { rows: df["clist"].str.includes(country).and(df["vtype"].str.includes("movie")) }
    ).sortValues(
        "imdb_rating", { ascending: false }
    ).head(5)

    let filtered_top5_series = df.iloc(
        { rows: df["clist"].str.includes(country).and(df["vtype"].str.includes("series")) }
    ).sortValues(
        "imdb_rating", { ascending: false }
    ).head(5)

    $("#movies-header").text(`Top Movies in ${country}`)
    addCards(filtered_top5_movies, MoviesDiv)

    $("#series-header").text(`Top Series in ${country}`)
    addCards(filtered_top5_series, SeriesDiv)

});