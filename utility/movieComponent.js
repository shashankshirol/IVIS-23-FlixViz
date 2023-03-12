
function createMovieRow(data){
let parent = document.getElementById("movieRow");
parent.innerHTML = "";


data = data.sort((a,b) => { return b.imdb_rating - a.imdb_rating})
data.map((movie, id) => {
if( id > 9)return
let child = document.createElement("div");
child.innerHTML = `
      <div id=${id} class="wrap" >
      <img src="${movie.img} alt="movieImage" class="row_poster" />
      <div class="poster_info">
          <div class="poster_text">
              <h4>${movie.title}</h4>
              <p >${movie.synopsis}</p>
          </div>
      </div>
    </div>
  `;

child.onclick = () => displayModal(movie, data)
parent.append(child)
})
};

