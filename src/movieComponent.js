function createMovieRow(data){
let parent = document.getElementById("movieRow");
parent.innerHTML = "";



data.map((movie, id) => {
if( data.length > 500)
if( id > 10)return
let child = document.createElement("div");

child.innerHTML = `
      <div class="wrap">
      <img src="${movie.img} alt="movieImage" class="row_poster" />
      <div class="poster_info">
          <div class="poster_text">
              <h4>${movie.title}</h4>
              <p>${movie.synopsis}</p>
          </div>
      </div>
    </div>
  `;
  parent.append(child)

});

}