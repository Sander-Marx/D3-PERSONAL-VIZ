const width = 500;
const height = 350;
const margin = { top: 30, right: 20, bottom: 50, left: 60 };




function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber);

  return date.toLocaleString("en-US", { month: "short" });
}

function getDayName(dayNumber) {
  const date = new Date();
  date.setDate(dayNumber);

  return date.toLocaleString("en-US", { weekday: "short" });
}


var tooltip = d3.select("body").append("div")   //does not work
    .attr("class", "tooltip")               
    .style("opacity", 0);



const drawChart = (
  svgElement,
  data,
  xLabel,
  yLabel,
  title,
  colorScales,
  bar,
  xAxisFormat
) => {
  const x = d3
    .scaleBand()
    .rangeRound([0, width])
    .padding(0.1)
    .domain(data.map((d) => d.key));


  const y = d3
    .scaleLinear()
    .rangeRound([height, 0])
    .domain([0, d3.max(data, (d) => d.value)])
    .nice();

  const colorScale =
    colorScales &&
    d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range(["#FEFF76", "#F50C11"]);

  const lineGenerator = d3
    .line()
    .x((d) => x(d.key))
    .y((d) => y(d.value))
    .curve(d3.curveMonotoneX);

  svgElement
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(xAxisFormat))
    .call((g) => g.selectAll(".domain").attr("stroke", "#ccc"))
    .call((g) => g.selectAll("line").attr("stroke", "#ccc"))
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#cccc");

  svgElement
    .append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y))
    .call((g) => g.selectAll(".domain").attr("stroke", "#ccc"))
    .call((g) => g.selectAll("line").attr("stroke", "#ccc"))
    .selectAll("text")
    .style("font-size", "12px")
    .style("fill", "#cccc");

  bar
    ? svgElement
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.key))
        .attr("y", (d) => y(d.value))
        .on('mouseover', function (d, i) {
          d3.select(this).transition()
               .duration('50')
               .attr('opacity', '.85');
               tooltip.transition()
               .duration('50')
               .style("opacity", 1);
          
          tooltip.html();
        })
       
        .on('mouseout', function (d, i) {
          d3.select(this).transition()
               .duration('50')
               .attr('opacity', '1');
               
               
        })
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - y(d.value))
        .attr("fill", (d) => (colorScales ? colorScale(d.value) : "steelblue"))
        .style("cursor", "pointer")   

    : svgElement
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")   .on('mouseover', function (d, i) {
          d3.select(this).transition()
               .duration('50')
               .attr('opacity', '.85');
               tooltip.transition()
               .duration('50')
               .style("opacity", 1);
               tooltip.html(data.value);
        })
        .on('mouseout', function (d, i) {
          d3.select(this).transition()
               .duration('50')
               .attr('opacity', '1');
               tooltip.transition()
               .duration('50')
               .style("opacity", 0);
        })
        .attr("stroke-width", 1.5)
        .attr("d", lineGenerator);

  //x axis label
  svgElement
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 10})`)
    .style("text-anchor", "middle")
    .text(xLabel);

  //y axis label
  svgElement
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(yLabel);

  // chart title
  svgElement
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 5)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text(title);
};


Promise.all([
  d3.json("BrowserHistory.json"),
  d3.json("watch-history.json"),
]).then(([browserHistory, watchHistory]) => {
  d3.select("#stats-since").text(
    new Date(watchHistory[watchHistory.length - 1].time).toLocaleDateString(
      "us-en",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    )
  );



  
  
  const watchHistoryByDay = d3
    .nest()
    .key((d) => new Date(d.time).getDay())
    .rollup((v) => v.length)
    .entries(watchHistory)
    .sort((a, b) => a.key - b.key);



  const watchHistoryByMonth = d3
    .nest()
    .key((d) => new Date(d.time).getMonth())
    .rollup((v) => v.length)
    .entries(watchHistory)
    .sort((a, b) => a.key - b.key);

  const watchHistoryByHour = d3
    .nest()
    .key((d) => new Date(d.time).getHours())
    .rollup((v) => v.length)
    .entries(watchHistory)
    .sort((a, b) => a.key - b.key);

  const browserHistoryByHour = d3
    .nest()
    .key((d) => new Date(d.time_usec / 1000).getHours())
    .rollup((v) => v.length)
    .entries(browserHistory["Browser History"])
    .sort((a, b) => a.key - b.key);

  const browserHistoryByMonth = d3
    .nest()
    .key((d) => new Date(d.time_usec / 1000).getMonth())
    .rollup((v) => v.length)
    .entries(browserHistory["Browser History"])
    .sort((a, b) => a.key - b.key);

  const browserHistoryByDay = d3
    .nest()
    .key((d) => new Date(d.time_usec / 1000).getDay())
    .rollup((v) => v.length)
    .entries(browserHistory["Browser History"])
    .sort((a, b) => a.key - b.key);

  // bar chart
  const svg = d3
    .select(".charts-container-browser")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  drawChart(
    svg,
    browserHistoryByHour,
    "Hour",
    "Number of Visits",
    "Browser History by Hour",
    true,
    true
  );



 

  // line chart for browser history by month
  const svg2 = d3
    .select(".charts-container-browser")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  drawChart(
    svg2,
    browserHistoryByMonth,
    "Month",
    "Number of Visits",
    "Browser History by Month",
    true,
    false,
    getMonthName
  );

  // bar chart for browser history by day of the week
  const svg3 = d3
    .select(".charts-container-browser")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
 ;
    
    
    
    
    

  drawChart(
    svg3,
    browserHistoryByDay,
    "Day",
    "Count",
    "Browsing by day of the week",
    false,
    true,
    getDayName
  );

///////////////////////////////////////////////////////////////////// Watch history///////////////////////////////////////////////

  const svg8 = d3
    .select(".charts-container-youtube")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  drawChart(
    svg8,
    watchHistoryByHour,
    "Hour",
    "Number of Visits",
    "Watch History by Hour",
    true,
    true
  );

  // line chart for watch history by month
  const svg4 = d3
    .select(".charts-container-youtube")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  drawChart(
    svg4,
    watchHistoryByMonth,
    "Month",
    "Number of Visits",
    "Watch History by Month",
    true,
    false,
    getMonthName
  );

  // bar chart for watch history by day of the week
  const svg5 = d3
    .select(".charts-container-youtube")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  drawChart(
    svg5,
    watchHistoryByDay,
    "Day",
    "Count",
    "Watch History by day of the week",
    false,
    true,
    getDayName
  );
//////////////////////////////////////////////////////////////Circle plots/////////////////////////////////////////////////
  // circular barplot for watch history by hour
  const svg7 = d3
    .select(".circular-charts")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${width / 2 + 50}, ${height / 2 + 50})`);

  const radius = Math.min(width, height) / 2;

  // X scale
  const x = d3
    .scaleBand()
    .range([0, 2 * Math.PI])
    .align(0)
    .domain(watchHistoryByHour.map((d) => d.key));

  // Y scale
  const y = d3
    .scaleRadial()
    .range([0, radius])
    .domain([0, d3.max(watchHistoryByHour, (d) => d.value)]);

  const colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(watchHistoryByHour, (d) => d.value)])
    .range(["#FEFF76", "#F50C11"]);

  // Add bars
  svg7
    .append("g")
    .selectAll("path")
    .data(watchHistoryByHour)
    .join("path")
    .attr("fill", (d) => colorScale(d.value)).on('mouseover', function (d, i) {
      d3.select(this).transition()
           .duration('50')
           .attr('opacity', '.85')
    })
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
           .duration('50')
           .attr('opacity', '1')
    })
    .attr(
      "d",
      d3
        .arc()
        .innerRadius(10)
        .outerRadius((d) => y(d["value"]))
        .startAngle((d) => x(d.key))
        .endAngle((d) => x(d.key) + x.bandwidth())
        .padAngle(0.01)
        .padRadius(radius / 2)
    );

  // append bigger outer circle
  svg7
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", radius)
    .attr("fill", "none")
    .attr("stroke", "#ccc");

  //add labels to the bars
  svg7
    .append("g")
    .selectAll("g")
    .data(watchHistoryByHour)
    .join("g")
    .attr("text-anchor", (d) =>
      (x(d.key) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI
        ? "end"
        : "start"
    )
    .attr(
      "transform",
      (d) => `
      rotate(${((x(d.key) + x.bandwidth() / 2) * 180) / Math.PI - 90})
      translate(${radius + 10},0)
    `
    )
    .append("text")
    .attr("transform", (d) =>
      (x(d.key) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI
        ? "rotate(180)"
        : "rotate(0)"
    )
    .text((d) => d.key)
    .attr("alignment-baseline", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#ccc");

  // chart title
  svg7
    .append("text")
    .attr("x", 0)
    .attr("y", -height / 2 - 30)
    .attr("font-size", "16px")
    .attr("text-anchor", "middle")
    .text("Watch History by Hour");

  // circular browser

  const svg9 = d3
    .select(".circular-charts")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${width / 2 + 50}, ${height / 2 + 50})`);

  const radiusB = Math.min(width, height) / 2;

  // X scale
  const xB = d3
    .scaleBand()
    .range([0, 2 * Math.PI])
    .align(0)
    .domain(browserHistoryByHour.map((d) => d.key));

  // Y scale
  const yB = d3
    .scaleRadial()
    .range([0, radiusB])
    .domain([0, d3.max(browserHistoryByHour, (d) => d.value)]);

  const colorScaleB = d3
    .scaleLinear()
    .domain([0, d3.max(browserHistoryByHour, (d) => d.value)])
    .range(["#FEFF76", "#F50C11"]);

  // Add bars
  svg9
    .append("g")
    .selectAll("path")
    .data(browserHistoryByHour)
    .join("path")
    .attr("fill", (d) => colorScaleB(d.value))
    
    .on('mouseover', function (d, i) {
      d3.select(this).transition()
           .duration('50')
           .attr('opacity', '.85');
           tooltip.transition()
           .duration('50')
           .style("opacity", 1);
           tooltip.html(d.value);
    })
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
           .duration('50')
           .attr('opacity', '1')
    })
    
    .attr(
      "d",
      d3
        .arc()
        .innerRadius(10)
        .outerRadius((d) => yB(d["value"]))
        .startAngle((d) => xB(d.key))
        .endAngle((d) => xB(d.key) + xB.bandwidth())
        .padAngle(0.01)
        .padRadius(radiusB / 2)
    );

  // append bigger outer circle
  svg9
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", radiusB)
    .attr("fill", "none")
    .attr("stroke", "#ccc");
  //add labels to the bars
  svg9
    .append("g")
    .selectAll("g")
    .data(watchHistoryByHour)
    .join("g")
    .attr("text-anchor", (d) =>
      (xB(d.key) + xB.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI
        ? "end"
        : "start"
    )
    .attr(
      "transform",
      (d) => `
    rotate(${((xB(d.key) + xB.bandwidth() / 2) * 180) / Math.PI - 90})
    translate(${radiusB + 10},0)
  `
    )
    .append("text")
    .attr("transform", (d) =>
      (xB(d.key) + xB.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI
        ? "rotate(180)"
        : "rotate(0)"
    )
    .text((d) => d.key)
    .attr("alignment-baseline", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#ccc");

  // chart title
  svg9
    .append("text")
    .attr("x", 0)
    .attr("y", -height / 2 - 30)
    .attr("font-size", "16px")
    .attr("text-anchor", "middle")
    .text("Browser History by Hour");

  // line chart for watch history by hour
  /*
  const svg6 = d3
    .select(".charts-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  drawChart(
    svg6,
    watchHistoryByHour,
    "Hour",
    "Number of Visits",
    "Watch History by Hour",
    true,
    false
  );
    */
});
