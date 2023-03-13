function ForceGraph(movieChoice, newData){
  createFDG(movieChoice, [], newData)
  genreFilter(movieChoice, newData)
  }

  function genreFilter(movieChoice, data){
    let selectedGenres = []
    function pillClick(d, genre){
      d.target.classList.toggle("pill--selected")
      if(selectedGenres.includes(genre)){
       selectedGenres.splice(selectedGenres.indexOf(genre), 1)
      }else{
        selectedGenres.push(genre)
      }
      let newData = data
      selectedGenres.map(currGenre => {
        newData = newData.filter(x => x.genre.includes(currGenre))
      })
      if(selectedGenres.length != 0){
        createFDG(movieChoice, newData, data)
      }
      else{createFDG(movieChoice, [], data)}
      
    }
    let parent = document.getElementById("modalGenres")
    parent.style.height = window.innerHeight/2.5 + "px"
    parent.innerHTML = ""
    let parent_header = document.createElement("div")
    parent_header.innerHTML = "<strong>Search Titles by Similar Genres</strong>"
    parent.append(parent_header)
    let genres = document.createElement("div")
    parent.append(genres)
    genres.style.overflow = "auto"
    genres.className = "genreList"
    genres.style.height = window.innerHeight/2.5 - 50+ "px"
    movieChoice.genre.split("|").map((x, id) => {
      let pill = document.createElement("div")
      pill.innerHTML = `
      <button id="${"genreButton"+id}" class="pill" type="button">${x}</button>
      `
      pill.querySelector("#"+"genreButton"+id).onclick = (d) => pillClick(d,x)
      genres.append(pill)
    })
  }



  function createFDG(movieChoice, similarTitle, data){
    var width = 480;
    var height = window.innerHeight/2.5
  
    var title = [movieChoice.title];
    var genre = movieChoice.genre.split("|");
      let arrLength = similarTitle.length
      if(similarTitle.length > 10) arrLength = 10; 
     similarTitle.sort((a, b) => (a.imdb_rating > b.imdb_rating) ? -1 : 1);
  
      var nodes = [];
      for (i = 0; i < title.length; i++) {
        nodes.push({name: title[i], weight: 14, fontsize: 17, circlecolor: "#E50914", fontcolor: "#92181E", poster: movieChoice.img, rating: movieChoice.imdb_rating});
      } 
      for (i = 0; i < arrLength; i++) {
        if (similarTitle[i].title == movieChoice.title){
          continue;
        };
        nodes.push({movieObject:similarTitle[i] ,name: similarTitle[i].title, weight: 12, fontsize: 17, circlecolor: "#D4B56C", fontcolor: "#92181E", poster: similarTitle[i].img, rating: similarTitle[i].imdb_rating});
      } 
  
      var links = [];
      for (i = 0; i < genre.length; i++) {
        nodes.push({name: genre[i], weight: 8, fontsize: 13, circlecolor: "#D2555B", fontcolor: "#000", poster: "none", rating: "none"})
        links.push({source: title[0], target: genre[i]});
      } 
  
      for (i = 0; i < arrLength; i++) {
        links.push({source: title[0], target: similarTitle[i].title});
      } 
  
      
  
      // const gethtml = (poster, name, rating) => {
      //   return `<div><img class="poster" src="${poster}"></img><p id="tooltiptext" style="text-align: center;">${name}</p><p id="tooltiptext" style="text-align: center">IMDB: ${rating}</p></div>`;
      // }
      document.getElementById("svgPlotForce").innerHTML= ""
      var svg = d3.selectAll('#svgPlotForce')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style("border", "3px dashed")
        .style("border-radius", "30px")
  
      // var tooltip = d3.select("#svgPlotForce").append("div")
      //  .attr("class", "tooltip")
      //  .style("opacity", 1);
      
      
      var simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink()
            .id(function(d){
              return d.name;
            })
            .links(links)
            
        )
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width/2, height/2))
        .on("tick", ticked);
  
  
        var link = svg
              .append("g")
              .attr("class", "link")
              .selectAll("line")
              .data(links)
              .enter()
              .append("line")
              .attr("stroke-width", 1.5)
              .attr("stroke-opacity", 0.7)
              .style("stroke", "grey");  
  
        var node = svg.append("g")
          .attr("class", "nodes")
          .selectAll("g")
          .data(nodes)
          .enter().append("g")
  
        var circles = node.append("circle")
          .attr("r", d => d.weight)
          .attr("fill",  d => d.circlecolor)
          .attr("stroke", "#FFF")
          .attr("stroke-width", 1.5)        
          .on('mouseover', function (d) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '.85')
                 .attr("r", d => d.weight+5)
                 
            // tooltipShow(d);
       })
       .on('mouseout', function (d) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '1')
                 .attr("r", d => d.weight);
            // tooltipHide(d);
       }).on("click", (d) => displayModal(d.movieObject, data));
    ;
      //  function tooltipShow(d){
      //   console.log(d)
      //   if (d.poster!="none"){
      //     tooltip.transition()
      //       .duration(50)
      //       .style("opacity", 1);
      //     tooltip.html(gethtml(d.poster, d.name, d.rating))
      //       .style("left", (480) + "px")
      //       .style("top", (0) + "px");
      //   }
      //  }
       
    //    function tooltipHide(d){
    //     if (d.poster!="none"){
    //       tooltip.transition()
    //         .duration(50)
    //         .style("opacity", 1);
    //     }
    //  }
      // Create a drag handler and append it to the node object instead
        var dragger = d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    
        dragger(node);
  
        var titles = node.append("text")
        .text(function(d) {
          return d.name;
        })
        .attr("font-family", "Bebas Neue")
        .attr("font-size", d => d.fontsize)
        .attr("fill", d => d.fontcolor)
        .attr('x',d => d.weight + 5)
        .attr('y', 3)
        .attr("pointer-events", "none")
  
        node.append("title")
          .text(function(d) { return d.name; });
        
        node.on('mouseover', function (d, i) {
          circles.attr('opacity', '.55')
          d3.select(this).transition()
               .duration('50')
               
        })
        .on('mouseout', function (d, i) {
          circles.attr('opacity', '1')
          d3.select(this).transition()
               .duration('50')
               .attr('opacity', '1')
        });
  
      function ticked(){
        link
          .attr("x1", function(d) {
            return d.source.x;
          })
          .attr("y1", function(d) {
            return d.source.y;
          })
          .attr("x2", function(d) {
            return d.target.x;
          })
          .attr("y2", function(d) {
            return d.target.y;
          });
  
          node.attr("transform", (d) => `translate(${d.x} ${d.y})`);
  
      }
  
  
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
  
      function dragged( d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
  
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
  }