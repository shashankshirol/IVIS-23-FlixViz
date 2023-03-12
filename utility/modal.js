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
  <div class ="modalSideInfo"><h4>Votes: </h4><p>${d.votes}</p></div>
  <div class ="modalSideInfo"> <h4>Imdb Rating: </h4><p>${d.imdb_rating}</p></div>
  <div class ="modalSideInfo"><h4>Links: 
  <a href="https://www.netflix.com/title/${
    d.nfid
  }" target="_blank">Netflix</a>&nbsp;</h4>
  
  <h4>
  <a href=${
    d.imdbid == null || d.imdbid.includes("|")
      ? "https://www.imdb.com/find/?q=" + encodeURIComponent(d.name)
      : "https://www.imdb.com/title/" + d.imdbid
  } target="_blank" id="imdb_link"> IMDB</a>
  </h4></div>
  <div class ="modalSideInfo"><p><strong>Genres:  </strong>${genres}</p></div>
  <div class ="modalSideInfo"><p><strong>Release Year:  </strong>${d.year}</p></div>
  <div class ="modalSideInfo"><p><strong>Added To Netflix:  </strong>${d.titledate}</p></div>
  </div>
</div>
`;
  ForceGraph(d, data);

  modal.style.display = "block";
}
