function createMovieRow(data) {
    let parent = document.getElementById("movieRow");
    parent.innerHTML = "";
    
    
    
    data.map((movie, id) => {
    if( data.length > 500)
    if( id > 10)return
      let child = document.createElement("div");
      child.innerHTML = `
          <div class="wrap">
          <img src="${movie.img}" alt="${movie.title}_poster" class="row_poster" />
          <div class="poster_info">
              <div class="poster_text">
                  <h4>${movie.title}</h4>
                  <p>${movie.synopsis}</p>
                  <a href="https://www.netflix.com/title/${movie.nfid}" target="_blank">Netflix</a>
                  <a href=${(movie.imdbid == null || movie.imdbid.includes("|")) ? "https://www.imdb.com/find/?q=" + encodeURIComponent(movie.title) : "https://www.imdb.com/title/" + movie.imdbid} target="_blank" id="imdb_link">IMDB</a>
              </div>
          </div>
        </div>
      `;
      parent.append(child)
    
    });
    
    }