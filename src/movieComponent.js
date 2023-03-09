
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
let span = document.getElementsByClassName("close")[0];
let modal = document.getElementById("myModal")

span.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
function handleClick(d){
let header = document.getElementById("title")
header.innerHTML = ""
header.innerHTML = d.title
let body = document.getElementById("modalBody")
body.innerHTML = `
<img src="${d.img} alt="movieImage" class="modalImg"/>
<div >
    <div>
        <h4>${d.title}</h4>
        <p>${d.synopsis}</p>
    </div>
</div>

`


modal.style.display = "block";
}
data.map((movie, id) => {
if( data.length > 500)
if( id > 10)return
let child = document.createElement("div");
if(selected.length!=0 && id < selected.length)
child.innerHTML = `
      <div id=${id}  class="wrap selected" >
      <img src="${movie.img} alt="movieImage" class="row_poster" />
      <div class="poster_info">
          <div class="poster_text">
              <h4>${movie.title}</h4>
              <p>${movie.synopsis}</p>
          </div>
      </div>
    </div>
  `;
else{
child.innerHTML = `
      <div id=${id} class="wrap selected" >
      <img src="${movie.img} alt="movieImage" class="row_poster" />
      <div class="poster_info">
          <div class="poster_text">
              <h4>${movie.title}</h4>
              <p>${movie.synopsis}</p>
          </div>
      </div>
    </div>
  `;
}
child.onclick = () => handleClick(movie)
  parent.append(child)

});

}