function table(data) {
  let tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  data.map((movie, id) => {
    if( id > 10)return
    let tr = document.createElement("tr");
    tr.innerHTML = `
        <td><img src="${movie.img}"></img></td>
        <td>${movie.title}</td>
        <td>${movie.vtype}</td>
        <td>${movie.year}</td>
        <td>${movie.imdb_rating}</td>
        <td>${movie.votes}</td>
        <td>${movie.genre}</td>
        `;
    tbody.append(tr)
  });
}
