function generate_scatter_plot(code) {
  let margin = { top: 5, right: 30, bottom: 30, left: 60 },
  width = window.innerWidth*0.75 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
  window.onresize = () => generate_scatter_plot(code)
  d3.select("#svgPlot").selectAll("svg").remove()
let svg = d3
  .selectAll("#svgPlot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom + 20)
  .style("border", "2px dashed")
  .style("border-radius", "20px")
  .style("padding", "4px")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


d3.json("../Data/data_netflix.json")
  .then(function (data) {
    const selections = {
      year: ["year", 1940, 2024, "Year"],
      imdb_rating: ["imdb_rating", 0, 10, "Imdb Rating"],
      votes: ["votes", 0, 3000000, "Votes"],
    };
    let currX = selections.imdb_rating;
    let currY = selections.votes;

    let countryData = data.filter((d) => d.clist.includes(code));
    let filteredData = countryData.filter(
      (x) => x.imdb_rating != null && x.votes != 0
    );
    data = filteredData;
    createMovieRow(data);
    // Define the x and y scales
    let x = d3.scaleLinear().domain([currX[1], currX[2]]).range([0, width]);
    let y = d3.scaleLinear().domain([currY[1], currY[2]]).range([height, 0]);
    let xAxis = svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    let yAxis = svg.append("g").call(d3.axisLeft(y));
    let yearSlider = slider_snap(1940, 2023, "Release Year", "year");
    let votesSlider = slider_snap( 0,3000,"Number of Votes(" + "K" + ")","votes");
    let ratingSlider = slider_snap(0, 10, "Imdb Rating", "rating");
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("y", 10)
      .attr("x", 50)
      .text(currY[3]);

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + margin.top + 30)
      .text(currX[3]);

    let clip = svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    //Interaction functions

    function mouseover() {
      Tooltip.style("opacity", 1);
      d3.select(this).attr("r", 8).style("opacity", 1);
    }
    function mouseout() {
      Tooltip.style("opacity", 0);
      d3.select(this).attr("r", 6).style("opacity", 0.5);
    }
    function mousemove(d) {
      Tooltip.html(
        d.title +
          ", " +
          d.year +
          ", " +
          "[" +
          d.imdb_rating +
          ", " +
          d.votes +
          "]"
      )
        .style("left", d3.mouse(this)[0] + 100 + "px")
        .style("top", d3.mouse(this)[1] + 100 + "px");
    }
    function mouseClick(d) {
      displayModal(d, data);
    }
    let Tooltip = d3
      .select("#svgPlot")
      .append("div")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("pointer-events", "none")
    let brush = d3
      .brush() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [width, height],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", updateChart);

    // Create the scatter variable: where both the circles and the brush take place
    let scatter = svg.append("g").attr("clip-path", "url(#clip)");
    scatter.append("g").attr("class", "brush").call(brush);
    // Add circles

    scatter
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d[currX[0]]);
      })
      .attr("cy", function (d) {
        return y(d[currY[0]]);
      })
      .attr("r", 6)
      .style("opacity", 0.5)
      .style("fill", "#FB0C0C")
      .attr("pointer-events", "all")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("click", mouseClick)
      .on("mousemove", mousemove);

    function updateFilters(newData) {
      scatter.selectAll("circle").remove();
      scatter
        .selectAll("circle")
        .data(newData)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return x(d[currX[0]]);
        })
        .attr("cy", function (d) {
          return y(d[currY[0]]);
        })
        .attr("r", 6)
        .style("opacity", 0.5)
        .style("fill", "#FB0C0C")
        .attr("pointer-events", "all")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", mouseClick)
        .on("mousemove", mousemove);
    }
    let idleTimeout;

    function idled() {
      idleTimeout = null;
    }
    function updateAll() {
      xAxis.transition().duration(1000).call(d3.axisBottom(x));
      yAxis.transition().duration(1000).call(d3.axisLeft(y));
      scatter
        .selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", function (d) {
          return x(d[currX[0]]);
        })
        .attr("cy", function (d) {
          return y(d[currY[0]]);
        });
    }
    function resetFilters() {
      votesSlider.reset();
      yearSlider.reset();
      ratingSlider.reset();
      selectedGenres = []
      document.getElementById("genreFilter").innerHTML = ""
      applyFilters()
    }
    document.getElementById("resetFilters").onclick = () => resetFilters();
    function updateChart(s = d3.event.selection) {
      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if (!s) {
        if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
        let rangex = ratingSlider.getRange()
        let rangey = votesSlider.getRange()
        x.domain([rangex[0], rangex[1]]);
        y.domain([rangey[0]*1000, rangey[1]*1000]);
      } else {
        newData = data.filter((d) => {
          let xVals = [s[0][0], s[1][0]].map(x.invert, x);
          let yVals = [s[1][1], s[0][1]].map(y.invert, y);
          if (
            d[currX[0]] < xVals[1] &&
            d[currX[0]] > xVals[0] &&
            d[currY[0]] < yVals[1] &&
            d[currY[0]] > yVals[0]
          )
            return d;
        });
        x.domain([s[0][0], s[1][0]].map(x.invert, x));
        y.domain([s[1][1], s[0][1]].map(y.invert, y));
        scatter.select(".brush").call(brush.move, null);

        // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and circle position
      updateAll();
    }




    let selectedGenres = [];
    function applyFilters() {
      yearRange = yearSlider.getRange();
      voteRange = votesSlider.getRange();
      ratingRange = ratingSlider.getRange();
      let newData = data.filter((x) => {
        if (
          x.imdb_rating >= ratingRange[0] &&
          x.imdb_rating <= ratingRange[1]
        )
          if (
            x.votes >= voteRange[0] * 1000 &&
            x.votes <= voteRange[1] * 1000
          )
            if (x.year >= yearRange[0] && x.year <= yearRange[1])
                return x;
      });
      selectedGenres.map(genre => {
        newData = newData.filter(x => x.genre.split(" | ").includes(genre))
      })
      updateFilters(newData);
      createMovieRow(newData);
      x.domain([ratingRange[0], ratingRange[1]]);
      y.domain([voteRange[0] * 1000, voteRange[1] * 1000]);
      updateAll();
    }
    d3.select("#year").on("change", function () {
      applyFilters()
    });
    d3.select("#votes").on("change", function () {
      applyFilters()
    });
    d3.select("#rating").on("change", function () {
      applyFilters()
    });
    //GENRE FILTER


    
    d3.json("../Data/countryToGenre.json")
      .then(function (genres) {
        let suggestions = Object.entries(genres[code]);
        handleSearch(suggestions)
        $("#flexSwitchCheckChecked").change(function () {
        if($("#flexSwitchCheckChecked").is(":checked")){
          document.getElementById("searchBarInput").placeholder = "Search for Titles"
          suggestions = countryData;
        }else{
          document.getElementById("searchBarInput").placeholder = "Search for Genres"
          suggestions = Object.entries(genres[code])
        }   
        handleSearch(suggestions)
      })
        function handleSearch(suggestions){
        // getting all required elements
        const searchWrapper = document.querySelector(".search-input");
        const inputBox = searchWrapper.querySelector("input");
        const suggBox = searchWrapper.querySelector(".autocom-box");  

        // if user press any key and release
        inputBox.onkeyup = (e) => {
          let userData = e.target.value; //user enetered data
          let emptyArray = [];
          if (userData) {
            emptyArray = suggestions.filter((data) => {
              //filtering array value and user characters to lowercase and return only those words which are start with user enetered chars
              let currData;
              if($("#flexSwitchCheckChecked").is(":checked")){
                currData = data.title
              }else{
                currData = data[0]
              }   
              return currData
                .toLocaleLowerCase()
                .startsWith(userData.toLocaleLowerCase());
            });
            emptyArray = emptyArray.map((data) => {
              let currData;
              if($("#flexSwitchCheckChecked").is(":checked")){
                currData = data.title
              }else{
                currData = data[0]
              }   
              // passing return data inside li tag
              return (data = `<li>${currData}</li>`);
            });
            searchWrapper.classList.add("active"); //show autocomplete box
            showSuggestions(emptyArray);
            let allList = suggBox.querySelectorAll("li");
            for (let i = 0; i < allList.length; i++) {
              //adding onclick attribute in all li tag
              allList[i].onclick = select;
            }
          } else {
            searchWrapper.classList.remove("active"); //hide autocomplete box
          }
        };
        function removeGenre(d, genre) {
          let genres = document.getElementById("genreFilter")
          genres.removeChild(d)
          selectedGenres.splice(selectedGenres.indexOf(genre), 1)
          applyFilters()

        }
        function select(element) {
          if($("#flexSwitchCheckChecked").is(":checked")){
            let movieObj = countryData.filter(x=> x.title == element.target.outerText)
            inputBox.value = "";
            searchWrapper.classList.remove("active");
            displayModal(movieObj[0], countryData)
          }else{

          let genre = element.target.outerText;
          inputBox.value = "";
          searchWrapper.classList.remove("active");
          let parent = document.getElementById("genreFilter");
          let pill = document.createElement("div");
          pill.innerHTML = `
    <button id = ${genre.split(",")[0]} class="pill selected" type="button">${genre}</button>
    `;
          
          pill.onclick = () => removeGenre(pill, genre.split(",")[0]);
          parent.append(pill);

          selectedGenres.push(genre.split(",")[0])
          applyFilters()
          }
        }
        function showSuggestions(list) {
          let listData;
          if (!list.length) {
            userValue = inputBox.value;
            listData = `<li>${userValue}</li>`;
          } else {
            listData = list.join("");
          }
          suggBox.innerHTML = listData;
        }
      }
    
      })
      .catch(function (error) {
        console.error(error);
      });
    
      resetFilters()
  })

  .catch(function (error) {
    console.error(error);
  });
}