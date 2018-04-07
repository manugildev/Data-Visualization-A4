var width = window.innerWidth;
var height = window.innerHeight;
var radius = Math.min(width, height) / 5;

var fileData;
var dataSize;
var step;
var maxAdditions = 0;
var maxDeletions = 0;
var usersArcWidth = 20;

function getRandomColor () {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var authors = [];

function allData () {
    d3.csv('data/memory.csv', function (data) {
          for (var i = 0; i < data.length; i++) {
              data[i]['index'] = i;

              var exits = false;
              var color = getRandomColor();
              for (var j = 0; j < authors.length; j++) {
                  if (authors[j]['author_id'] === data[i]['author_id']) {
                      color = authors[j]['color'];
                      exits = true;
                      break;
                  }
              }

              if (!exits) {
                  authors.push({'author_id': data[i]['author_id'], 'color': color});
              }

              data[i]['color'] = color;
              // Get Max number of additions and deletions
              maxAdditions = Math.max(maxAdditions, data.n_additions);
              maxDeletions = Math.max(maxDeletions, data.n_deletions);
          }

          onLoad(data);
      }
    );
}

function onLoad (data) {
    fileData = data;
    dataSize = data.length;
    step = (Math.PI * 2) / dataSize;
    console.log(step);
    console.log('Data Loaded: ' + data.length);
    drawChart();

}

function drawChart () {
    var g = svg.selectAll('path.arc-path').data(fileData).enter().append('g');

    g.append('svg:path')
      .attr('class', 'arc-path')
      .attr('fill', function (d) {
          return '#2ecc71';
      })
      .attr('d', drawAdditionsArc);

    g.append('svg:path')
      .attr('class', 'arc-path')
      .attr('fill', function (d) {
          return '#e74c3c';
      })
      .attr('d', drawDeletionsArc);

    g.append('svg:path')
      .attr('class', 'arc-path')
      .attr('fill', function (d) {
          return d.color;
      })
      .attr('stroke', function (d) {
          return d.color;
      })
      /*.style("opacity", function (d) {
          return (d.author_total_additions / d.total_additions) * 2.5;
      })*/
      .attr('d', drawArc);
}

allData();

var drawArc = d3.arc()
  .outerRadius(function (d) { return radius - 3;})
  .innerRadius(radius - usersArcWidth)
  .startAngle(function (d) { return d.index * step;})
  .endAngle(function (d) { return (d.index + 1) * step;});

var drawAdditionsArc = d3.arc()
  .outerRadius(function (d) { return radius + d.n_additions / 2;})
  .innerRadius(radius)
  .startAngle(function (d) { return d.index * step;})
  .endAngle(function (d) { return (d.index + 1) * step;});

var drawDeletionsArc = d3.arc()
  .outerRadius(function (d) { return radius + d.n_additions / 2 + d.n_deletions / 2;})
  .innerRadius(function (d) { return radius + d.n_additions / 2;})
  .startAngle(function (d) { return d.index * step;})
  .endAngle(function (d) { return (d.index + 1) * step;});

var svg = d3.select('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');



