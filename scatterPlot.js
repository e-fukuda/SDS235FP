//color code based on article type

//source on how to create scatterplot: http://rajvansia.com/scatterplotbrush-d3-v4.html
//read in kaggle fake news data


d3.csv("fake.csv", function(data){
  var body = d3.select('body')
  //y data contains popularity counts
  var yData = [ 
                     { "text" : "likes" },
                     { "text" : "comments" },
                     { "text" : "participants_count"},
                   ];
  var xData = [ { "text" : "spam_score" },
                     { "text" : "published" },
                   ];
  
  var articleType = [ { "text" : "All Types" },
                     { "text" : "conspiracy" },
                     { "text" : "satire" },
                     { "text" : "bs"},
                     { "text" : "hate"},
                     { "text" : "junksci"},
                     { "text" : "state"},
                     { "text" : "bias"},
                   ];
                   
   // Select Article Type
  var span = body.append('span')
    .text('Select Article Type: ')
  var articleInput = body.append('select')
      .attr('id','articleSelect')
      .on('change',articleChange)
    .selectAll('option')
      .data(articleType)
      .enter()
    .append('option')
      .attr('value', function (d) { return d.text })
      .text(function (d) { return d.text ;})
  body.append('br')
    
    // Select X-axis Variable
  var span = body.append('span')
    .text('Select X-Axis variable: ')
  var xInput = body.append('select')
      .attr('id','xSelect')
      .on('change',xChange)
    .selectAll('option')
      .data(xData)
      .enter()
    .append('option')
      .attr('value', function (d) { return d.text })
      .text(function (d) { return d.text ;})
  body.append('br')

  // Select Y-axis Variable
  var span = body.append('span')
      .text('Select Y-Axis variable: ')
  var yInput = body.append('select')
      .attr('id','ySelect')
      .on('change',yChange)
    .selectAll('option')
      .data(yData)
      .enter()
    .append('option')
      .attr('value', function (d) { return d.text })
      .text(function (d) { return d.text ;})
  body.append('br')
  
    // Variables
  var body = d3.select('body')
  //margins for label space
  var margin = { top: 50, right: 50, bottom: 50, left: 50 }
  var h = 600 - margin.top - margin.bottom
  var w = 800 - margin.left - margin.right
  // Scales
  var colorScale = d3.schemeCategory20;
  var xScale = d3.scaleLinear()
    .domain([
      d3.min([0,d3.min(data,function (d) { return d['spam_score'] })]),
      d3.max([0,d3.max(data,function (d) { return d['spam_score'] })])
      ])
    .range([0,w])
  var yScale = d3.scaleLinear()
    .domain([
      d3.min([0,d3.min(data,function (d) { return d['likes'] })]),
      d3.max([0,d3.max(data,function (d) { return d['likes'] })])
      ])
    .range([h,0])
  // SVG
  var svg = body.append('svg')
      .attr('height',h + margin.top + margin.bottom)
      .attr('width',w + margin.left + margin.right)
    .append('g')
      .attr('transform','translate(' + margin.left + ',' + margin.top + ')')
  // X-axis
  var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(10, "s")
    
   // text label for the x axis, source: https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
  svg.append("text")             
      .style("text-anchor", "middle")
      .attr("x", w/2)
      .attr("y", h+40)
      .attr("id", "xAxisLabel")
      .text("spam_score");
  // Y-axis
  var yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(20, "s")
     svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (h / 3))
      .attr("dy", "1em")
      .attr("id", "yAxisLabel")
      .style("text-anchor", "middle")
      .text("likes"); 
      
  // Circles
  //start with all types of articles
  var circles = svg.selectAll('circle')
      .data(data)
      .enter()
    .append('circle')
        .attr("id", "circles")
      .attr('cx',(function (d) { return xScale(d['spam_score']) }))
      .attr('cy',function (d) { return yScale(d['likes']) })
      .attr('r','3')
      .attr('stroke','black')
      .attr('stroke-width',1)
      //.attr('fill',function (d,i) { return colorScale[i] })
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',6)
          .attr('stroke-width',3)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',3)
          .attr('stroke-width',1)
      })
    .append('title') // Tooltip
      .text(function (d) { return d.variable +
                                      '\ntitle: ' + (d['title']) +
                                      '\npublish date: ' + (d['published']) +
                                      '\nspam_score: ' + (d['spam_score']) +
                                       '\nlikes: ' + (d['likes']) +
                                       '\ntype:' + (d['type'])
                                           })
  // X-axis
  svg.append('g')
      .attr('class','axis')
      .attr('id','xAxis')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis)
      
  // Y-axis
  svg.append('g')
      .attr('class','axis')
      .attr('id','yAxis')
      .call(yAxis)
   
   //Brush
    var brush = d3.brush()
    .extent([[-50, -50], [w+20, h+20]])
    .on("start brush end", brushmoved);
    
    var gBrush = svg.append("g")
        .attr("class", "brush")
        .call(brush);

  
    function brushmoved() {
  var s = d3.event.selection;
  if (s === null) {
  } else {
      //how to use brush selection:
      // http://stackoverflow.com/questions/38492633/what-is-the-correct-argument-for-d3-brushselection
      console.log(d3.brushSelection(d3.select(".brush").node())[0], d3.brushSelection(d3.select(".brush").node())[1]);
      var brushSelect = d3.brushSelection(d3.select(".brush").node()); 
      //use filter to get data - how do we do this?
      var selectedData = data.filter(function(d){

      });
      console.log(selectedData);
  }
}

  function yChange() {
    var value = this.value // get the new y value
    if(value == 'published'){
        
    }
    yScale // change the yScale
      .domain([
        d3.min([0,d3.min(data,function (d) { return d[value] })]),
        d3.max([0,d3.max(data,function (d) { return d[value] })])
        ])
    yAxis.scale(yScale) // change the yScale
    d3.select('#yAxis') // redraw the yAxis
      .transition().duration(1000)
      .call(yAxis)
    d3.select('#yAxisLabel') // change the yAxisLabel
      .text(value)
      
    d3.selectAll('circle') // move the circles
      .transition()
        .attr('cy',(function (d) { return yScale(d[value]) }))
    
  }

  function xChange() {
    var value = this.value // get the new x value
    if (value == 'published'){
        xScale = d3.scaleTime()
        .domain([
      d3.min([0,d3.min(data,function (d) { return d[value] })]),
      d3.max([0,d3.max(data,function (d) { return d[value] })])
      ])
    }
    else{
        xScale // change the xScale
          .domain([
            d3.min([0,d3.min(data,function (d) { return d3.isoParse(d[value]) })]),
            d3.max([0,d3.max(data,function (d) { return d3.isoParse(d[value]) })])
            ])
    }
    xAxis.scale(xScale) // change the xScale
    d3.select('#xAxis') // redraw the xAxis
      .transition().duration(1000)
      .call(xAxis)
    d3.select('#xAxisLabel') // change the xAxisLabel
      .transition().duration(1000)
      .text(value)
    d3.selectAll('circle') // move the circles
        .attr('cx',function (d) { return xScale(d[value]) })
  }
  
  function articleChange(){
      var value = this.value;
      // .filter(function(d) { return d.type == value })
            

              //.enter().append('circle')
              //.exit().remove();
      //svg.selectAll("circle").data(data, filter(function(d) { return d.type !== value }))
       //       .exit().remove();
      //svg.selectAll("circle").filter(function(d) { return d.type == value }).exit().remove();
      //

      if(value === "All Types"){
svg.selectAll('circle')
      .data(data)
      .enter()
    .append('circle')
        .attr("id", "circles")
      .attr('cx',(function (d) { return xScale(d['spam_score']) }))
      .attr('cy',function (d) { return yScale(d['likes']) })
      .attr('r','3')
      .attr('stroke','black')
      .attr('stroke-width',1)
      //.attr('fill',function (d,i) { return colorScale[i] })
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',6)
          .attr('stroke-width',3)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',3)
          .attr('stroke-width',1)
      })
    .append('title') // Tooltip
      .text(function (d) { return d.variable +
                                      '\ntitle: ' + (d['title']) +
                                      '\npublish date: ' + (d['published']) +
                                      '\nspam_score: ' + (d['spam_score']) +
                                       '\nlikes: ' + (d['likes']) +
                                       '\ntype:' + (d['type'])
                                           })
        }
               
      else{
          
            svg.selectAll('circle')
      .data(data)
      .enter()
    .append('circle')
        .attr("id", "circles")
      .attr('cx',(function (d) { return xScale(d['spam_score']) }))
      .attr('cy',function (d) { return yScale(d['likes']) })
      .attr('r','3')
      .attr('stroke','black')
      .attr('stroke-width',1)
      //.attr('fill',function (d,i) { return colorScale[i] })
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',6)
          .attr('stroke-width',3)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',3)
          .attr('stroke-width',1)
      })
    .append('title') // Tooltip
      .text(function (d) { return d.variable +
                                      '\ntitle: ' + (d['title']) +
                                      '\npublish date: ' + (d['published']) +
                                      '\nspam_score: ' + (d['spam_score']) +
                                       '\nlikes: ' + (d['likes']) +
                                       '\ntype:' + (d['type'])
                                           })
                svg.selectAll("circle").filter(function(d) { return d.type !== value }).remove();
            }
  }

})