function table(data) {
  let tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  data.map((movie, id) => {
    if( id > 10)return

    let tr = document.createElement("tr");
    tr.innerHTML = `
        <td><img class="poster" src="${movie.img}"></img></td>
        <td>${movie.title}</td>
        <td>${movie.vtype}</td>
        <td>${movie.year}</td>
        <td>${movie.imdb_rating == null ? "No data" : movie.imdb_rating}</td>
        <td>${movie.votes}</td>
        <td>${movie.genre}</td>
        <td><a href="https://www.netflix.com/browse?jbv=${movie.nfid}">Netflix</a>${(movie.imdbid != null && movie.votes != 0) ?  ` <a href="https://www.imdb.com/title/${movie.imdbid}">Imdb</a>` : ""}</td>
        `;
    tbody.append(tr)
  });
}
