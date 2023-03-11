
function createMovieRow(data, selected){
let parent = document.getElementById("movieRow");
parent.innerHTML = "";

let rowData = (selected.length == 0 ? data : selected)
if(selected.length != 0){
  selected.map(x =>{
console.log(x)
    data = data.filter(y => y.id !== x.id)
    data.unshift(x)
  })
}
data = data.sort((a,b) => { return b.imdb_rating - a.imdb_rating})
data.map((movie, id) => {
if( id > 9)return
let child = document.createElement("div");
child.innerHTML = `
      <div id=${id} class="wrap selected" >
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

