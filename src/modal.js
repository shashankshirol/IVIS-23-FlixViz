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
function displayModal(d){
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