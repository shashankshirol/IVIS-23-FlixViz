function slider_snap(min, max, label, id) {
  let layout = {
    width: 400,
    height: 80,
    margin: {
      top: 20,
      bottom: 20,
      left: 40,
      right: 40,
    },
  };

  let starting_min = min;
  let starting_max = max;
  var range = [min, max];
  var starting_range = [min, max];

  // set width and height of svg
  var w = layout.width;
  var h = layout.height;
  var margin = layout.margin;

  // dimensions of slider bar
  var width = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;

  // create x scale
  var x = d3
    .scaleLinear()
    .domain(range) // data space
    .range([0, width]); // display space

  
  // create svg and translated g
  var svg = d3
    .select("#" + id)
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  svg
    .append("text")
    .attr("y", 15)
    .attr("x", 50)
    .text(label);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // draw background lines
  g.append("g")
    .selectAll("line")
    .data(d3.range(range[0], range[1] + 1))
    .enter()
    .append("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "#ccc");

  // labels
  var labelL = g
    .append("text")
    .attr("id", "labelleft")
    .attr("x", 0)
    .attr("y", height + 5)
    .text(starting_min);

  var labelR = g
    .append("text")
    .attr("id", "labelright")
    .attr("x", 0)
    .attr("y", height + 5)
    .text(starting_max);

  // define brush
  var brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("brush", function () {
      var s = d3.event.selection;
      // update and move labels
      labelL.attr("x", s[0]).text(Math.round(x.invert(s[0])));
      labelR.attr("x", s[1]).text(Math.round(x.invert(s[1])));
      // move brush handles
      handle.attr("display", null).attr("transform", function (d, i) {
        return "translate(" + [s[i], -height / 4] + ")";
      });
      // update view
      // if the view should only be updated after brushing is over,
      // move these two lines into the on('end') part below
    })
    .on("end", function () {
      if (!d3.event.sourceEvent) return;
      var d0 = d3.event.selection.map(x.invert);
      var d1 = d0.map(Math.round);
      d3.select(this).transition().call(d3.event.target.move, d1.map(x));
      var s = d3.event.selection;
      svg.node().value = s.map((d) => Math.round(x.invert(d)));
      let event = new Event("change");
      if(id == "year")
      year.dispatchEvent(event);
      else if(id == "votes")
      votes.dispatchEvent(event);
      else{
      rating.dispatchEvent(event);
      }
    });

  // append brush to g
  var gBrush = g.append("g").attr("class", "brush").call(brush);

  // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
  var brushResizePath = function (d) {
    var e = +(d.type == "e"),
      x = e ? 1 : -1,
      y = height / 2;
    return (
      "M" +
      0.5 * x +
      "," +
      y +
      "A6,6 0 0 " +
      e +
      " " +
      6.5 * x +
      "," +
      (y + 6) +
      "V" +
      (2 * y - 6) +
      "A6,6 0 0 " +
      e +
      " " +
      0.5 * x +
      "," +
      2 * y +
      "Z" +
      "M" +
      2.5 * x +
      "," +
      (y + 8) +
      "V" +
      (2 * y - 8) +
      "M" +
      4.5 * x +
      "," +
      (y + 8) +
      "V" +
      (2 * y - 8)
    );
  };

  var handle = gBrush
    .selectAll(".handle--custom")
    .data([{ type: "w" }, { type: "e" }])
    .enter()
    .append("path")
    .attr("class", "handle--custom")
    .attr("stroke", "#000")
    .attr("fill", "#eee")
    .attr("cursor", "ew-resize")
    .attr("d", brushResizePath);

  // override default behaviour - clicking outside of the selected area
  // will select a small piece there rather than deselecting everything
  // https://bl.ocks.org/mbostock/6498000
  gBrush
    .selectAll(".overlay")
    .each(function (d) {
      d.type = "selection";
    })
    .on("mousedown touchstart", brushcentered);

  function brushcentered() {
    var dx = x(1) - x(0), // Use a fixed width when recentering.
      cx = d3.mouse(this)[0],
      x0 = cx - dx / 2,
      x1 = cx + dx / 2;
    d3.select(this.parentNode).call(
      brush.move,
      x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]
    );
  }

  // select entire starting range
  gBrush.call(brush.move, starting_range.map(x));

  function reset() {
    gBrush.call(brush.move, starting_range.map(x));
  }
  var getRange = function () {
    var range = d3
      .brushSelection(gBrush.node())
      .map((d) => Math.round(x.invert(d)));
    return range;
  };
  function setRange(range){
    console.log(range)
  }

  return { getRange: getRange, reset: reset, setRange:setRange };
}
