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
                  <h6>${movie.title}</h6>
                  <p >${movie.synopsis.length > 100 ? movie.synopsis.slice(0, 100) + "..." : movie.synopsis}</p>
                  <a href="https://www.netflix.com/title/${movie.nfid}" target="_blank">Netflix</a>
                <a href=${(movie.imdbid == null || movie.imdbid.includes("|")) ? "https://www.imdb.com/find/?q=" + encodeURIComponent(movie.name) : "https://www.imdb.com/title/" + movie.imdbid} target="_blank" id="imdb_link">IMDB</a>
              </div>
          </div>
        </div>
      `;
    
    child.onclick = () => displayModal(movie, data)
    parent.append(child)
    })
    };