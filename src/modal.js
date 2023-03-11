let span = document.getElementsByClassName("close")[0];
let modal = document.getElementById("myModal");

span.onclick = function () {
  modal.style.display = "none";
};
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
function displayModal(d, data) {
  let header = document.getElementById("title");
  header.innerHTML = "";
  header.innerHTML = d.title;
  let body = document.getElementById("modalBodyInfo");
  let genres = d.genre.split("|")
  genres = genres.length > 4 ? genres.slice(0, 4) + "..." : genres
  body.innerHTML = `
<div class=modalView>
  <img src="${d.img} alt="movieImage" class="modalImg"/>
  <div class="modalSummary">
      <h4>${d.title}</h4>
      <p style="padding-right: 100px; padding-top: 20px">${d.synopsis}</p>
  </div>
  <div class="modalInfo" >
  <h4>Votes: ${d.votes}</h4>
  <h4>Imdb Rating: ${d.imdb_rating}</h4>
  <h4>
  <a href="https://www.netflix.com/title/${
    d.nfid
  }" target="_blank">Netflix</a></h4>
  <h4>
  <a href=${
    d.imdbid == null || d.imdbid.includes("|")
      ? "https://www.imdb.com/find/?q=" + encodeURIComponent(d.name)
      : "https://www.imdb.com/title/" + d.imdbid
  } target="_blank" id="imdb_link">IMDB</a>
  </h4>
  <h4>Genres: ${genres}</h4>
  </div>
</div>
`;
  ForceGraph(d, data);

  modal.style.display = "block";
}
