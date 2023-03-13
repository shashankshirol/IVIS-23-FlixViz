function setup_modal() {
  let span = document.getElementsByClassName("close")[0];
  window.modal = document.getElementById("myModal");
  span.onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function displayModal(d, data) {
  modalContent = document.getElementById("modalContent")
  modalContent.style.height = window.innerHeight*0.8 + "px"
  let header = document.getElementById("title");
  header.innerHTML = "";
  header.innerHTML = d.title;
  let body = document.getElementById("modalBodyInfo");
  let genres = d.genre.split("|")
  genres = genres.length > 4 ? genres.slice(0, 4) + "..." : genres
  let imgheight = window.innerHeight/4
  body.innerHTML = `
<div class=modalView id="modalView">
  <img src="${d.img}" alt="movieImage" />
  <div class="modalSummary" style="text-align:left;">
      <h4>${d.title}</h4>
      <p> <strong>Genres:</strong> ${genres}</p>
      <p>${d.synopsis}</p>
  </div>
  <div class="modalInfo" >
  <div class ="modalSideInfo"><p><strong>Votes: </strong>${numberWithCommas(d.votes)}</p></div>
  <div class ="modalSideInfo"><p><strong>IMDb Rating: </strong>${d.imdb_rating}</p></div>
  <div class ="modalSideInfo">
  <p>
  <a href="https://www.netflix.com/title/${
    d.nfid
  }" target="_blank">Netflix</a>&nbsp;
  <a href=${
    d.imdbid == null || d.imdbid.includes("|")
      ? "https://www.imdb.com/find/?q=" + encodeURIComponent(d.title)
      : "https://www.imdb.com/title/" + d.imdbid
  } target="_blank" id="imdb_link"> IMDB</a>
  </p>
  </div>
  <div class ="modalSideInfo"><p><strong>Release Year:  </strong>${d.year}</p></div>
  <div class ="modalSideInfo"><p><strong>Added To Netflix:  </strong>${d.titledate}</p></div>
  </div>
</div>
`;
  ForceGraph(d, data);
  document.getElementById("modalView").style.height = imgheight + "px"
  modal.style.display = "block";
}