var width = window.innerWidth;
var height = window.innerHeight;
var radius = Math.min(width, height) / 6;
var contributions_radius = radius - 100;

var fileData;
var dataSize;
var step;
var maxAdditions = 0;
var maxDeletions = 0;
var usersArcWidth = 20;
var additions_radius = 100;
var deletions_radius = 100;
var total_lines = 0;
var lines_step = 0;
var current_lines = 0;
var current_total_lines = 0.0;
var lines_arc;
var authors = [];
var years = [];
var year_color_scale = d3.scaleOrdinal(d3.schemeCategory20);
var element_duration = 200;
var single_duration = 10;
var initial_animation_finished = false;

function getRandomColor(t) {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return d3.interpolateYlGnBu(t);
}


function allData() {
    d3.csv('data/memory.csv', function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i]['index'] = i;

                var exits = false;
                var color = getRandomColor(1 - data[i]['rank'] / 130);
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

                var date = new Date(data[i]['author_timestamp'] * 1000);
                var hours = date.getHours();
                var minutes = "0" + date.getMinutes();
                var seconds = "0" + date.getSeconds();
                var year = date.getFullYear();
                data[i]['year'] = year;

                exits = false;
                for (var w = 0; w < years.length; w++) {
                    if (years[w]['year'] === year) {
                        exits = true;
                        console.log(year + " exists");
                        years[w]['times'] += 1;
                        years[w]['_times'] += 1;
                        years[w]['authors'] += " author_" + data[i]["author_id"];
                        years[w]['written'] += parseInt(data[i].n_additions) + parseInt(data[i].n_deletions);
                        break;
                    }
                }
                if (!exits) {
                    if (years.length === 0)
                        years.push({
                            'year': year,
                            'times': 1,
                            '_times': 1,
                            'color': year_color_scale(years.length),
                            'authors': "author_" + data[i]["author_id"],
                            'written': 0,
                            'total': parseInt(data[i].total_additions) + parseInt(data[i].total_deletions)
                        });
                    else years.push({
                        'year': year,
                        'times': years[years.length - 1]['times'] + 1,
                        '_times': 1,
                        'color': year_color_scale(years.length),
                        'authors': "author_" + data[i]["author_id"],
                        'written': 0,
                        'total': parseInt(data[i].total_additions) + parseInt(data[i].total_deletions)
                    });
                }
            }

            onLoad(data);
        }
    );
}

function onLoad(data) {
    fileData = data;
    dataSize = data.length;
    total_lines = data[0].total_additions - data[0].total_deletions;
    step = (Math.PI * 2) / dataSize;
    lines_step = (Math.PI * 2) / total_lines;
    drawChart();

}

function setTextOnMouseOver(d) {
    if (!initial_animation_finished) return;
    svg.select('text').text("Author #" + d.author_id)
        .transition().duration(200)
        .attr("fill-opacity", 1);
    svg.selectAll(".arc-path").attr('stroke-width', 0)
        .transition().duration(200).attr("fill-opacity", 0.2).attr("stroke-opacity", 0);
    svg.selectAll(".years-path").attr('stroke-width', 0)
        .transition().duration(200).attr("fill-opacity", 0.2).attr("stroke-opacity", 0);
    svg.selectAll(".author_" + d.author_id).attr('stroke-width', 1)
        .transition().duration(200).attr("fill-opacity", 1).attr("stroke-opacity", 1);

    var percent = (parseInt(d.author_total_additions) + parseInt(d.author_total_deletions)) / (parseInt(d.total_additions) + parseInt(d.total_deletions)) * 100;
    percent = Math.round(percent * 100) / 100;

    var contributions = svg.selectAll(".author_" + d.author_id).filter(".contributions-path");
    console.log(contributions._groups[0].length);

    svg.select('text').text("Author #" + d.author_id);
    svg.select('.percent_text').text(percent + "%");
    svg.select('.info_text1').text("written by this author");
    svg.select('.info_text2').text("in " + contributions._groups[0].length + " commits.");
    svg.select('.info_text3').text("Rank: " + parseInt(d.rank) + "/" + authors.length);

    svg.select('text').transition().duration(200).attr("fill-opacity", 1);
    svg.select('.percent_text').transition().duration(200).attr("fill-opacity", 1);
    svg.select('.info_text1').transition().duration(200).attr("fill-opacity", 1);
    svg.select('.info_text2').transition().duration(200).attr("fill-opacity", 1);
    svg.select('.info_text3').transition().duration(200).attr("fill-opacity", 1);
}

function setTextOnMouseOut(d) {
    if (!initial_animation_finished) return;
    svg.select('text').attr("fill-opacity", 0);

    svg.selectAll(".arc-path")
        .transition().duration(200).attr("fill-opacity", 1).attr("stroke-opacity", 1);
    svg.selectAll(".years-path")
        .transition().duration(200).attr("fill-opacity", 1).attr("stroke-opacity", 1);


    svg.select('text').transition().duration(200).attr("fill-opacity", 0);
    svg.select('.percent_text').transition().duration(200).attr("fill-opacity", 0);
    svg.select('.info_text1').transition().duration(200).attr("fill-opacity", 0);
    svg.select('.info_text2').transition().duration(200).attr("fill-opacity", 0);
    svg.select('.info_text3').transition().duration(200).attr("fill-opacity", 0);

}

function yearMouseOver(d) {
    if (!initial_animation_finished) return;
    svg.selectAll(".arc-path").attr('stroke-width', 0)
        .transition().duration(200).attr("fill-opacity", 0.2).attr("stroke-opacity", 0);
    svg.selectAll(".years-path").attr('stroke-width', 0)
        .transition().duration(200).attr("fill-opacity", 0.2).attr("stroke-opacity", 0);
    svg.selectAll(".year_" + d.year).attr('stroke-width', 1)
        .transition().duration(200).attr("fill-opacity", 1).attr("stroke-opacity", 1);

    var percent = d.written / d.total * 100;
    percent = Math.round(percent * 100) / 100;

    svg.select('text').text("Year: " + d.year);
    svg.select('.percent_text').text(percent + "%");
    svg.select('.info_text1').text("written this year");
    svg.select('.info_text2').text("in " + d._times + " commits.");

    svg.select('text').transition().duration(200).attr("fill-opacity", 1);
    svg.select('.percent_text').transition().duration(200).attr("fill-opacity", 1);
    svg.select('.info_text1').transition().duration(200).attr("fill-opacity", 1);
    svg.select('.info_text2').transition().duration(200).attr("fill-opacity", 1);
    svg.select('.info_text3').transition().duration(200).attr("fill-opacity", 0);
}

function yearMouseOut(d) {
    if (!initial_animation_finished) return;
    svg.selectAll(".arc-path")
        .transition().duration(200).attr("fill-opacity", 1).attr("stroke-opacity", 1).attr('stroke-width', 1);
    svg.selectAll(".years-path")
        .transition().duration(200).attr("fill-opacity", 1).attr("stroke-opacity", 1).attr('stroke-width', 1);


    svg.select('text').transition().duration(200).attr("fill-opacity", 0);
    svg.select('.percent_text').transition().duration(200).attr("fill-opacity", 0);
    svg.select('.info_text1').transition().duration(200).attr("fill-opacity", 0);
    svg.select('.info_text2').transition().duration(200).attr("fill-opacity", 0);
    svg.select('.info_text3').transition().duration(200).attr("fill-opacity", 0);
}


function myCallback(d) {
    var date = new Date(d['author_timestamp'] * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var day = date.getDay() + 1;
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    svg.select('text').text(day + "/" + month + "/" + year);
    current_lines += parseInt(d.n_additions);
    current_total_lines += parseFloat(d.n_additions) + parseFloat(d.n_deletions);
    if (current_lines === parseInt(d.total_additions)) {
        initial_animation_finished = true;
        svg.select('text').transition().duration(700).attr("fill-opacity", 0);
        svg.select('.percent_text').transition().duration(700).attr("fill-opacity", 0);
        svg.select('.info_text1').transition().duration(700).attr("fill-opacity", 0);
        svg.select('.info_text2').transition().duration(700).attr("fill-opacity", 0);
    }

    var text = current_total_lines / (parseFloat(d.total_additions) + parseFloat(d.total_deletions)) * 100;
    svg.select('.percent_text').text(parseInt(text) + "%");
}

function drawChart() {
    var g = svg.selectAll('path.arc-path').data(fileData).enter().append('g');

    g.append('svg:path')
        .attr('class', function (d, i) {
            return 'arc-path author_' + d.author_id + ' year_' + d.year;
        })
        .attr('fill', '#139639')
        .on("mouseover", function (d) {
            setTextOnMouseOver(d);
        })
        .on("mouseout", function (d) {
            setTextOnMouseOut(d);
        })
        .transition()
        .delay(function (d, i) {
            return element_duration + i * single_duration;
        })
        .duration(element_duration)
        .attrTween("d", tweenPieAdditions)
        .transition()
        .attrTween("d", tweenDonutAdditions);

    g.append('svg:path')
        .attr('class', function (d, i) {
            return 'arc-path author_' + d.author_id + ' year_' + d.year;
        })
        .attr('fill', '#e2120c')
        .on("mouseover", function (d) {
            setTextOnMouseOver(d);
        })
        .on("mouseout", function (d) {
            setTextOnMouseOut(d);
        })
        .transition()
        .delay(function (d, i) {
            return element_duration + 50 + i * single_duration;
        })
        .duration(element_duration)
        .attrTween("d", tweenPieDeletions)
        .transition()
        .attrTween("d", tweenDonutDeletions);

    g.append('svg:path')
        .on("mouseover", function (d) {
            setTextOnMouseOver(d);
        })
        .on("mouseout", function (d) {
            setTextOnMouseOut(d);
        })
        .attr('class', function (d, i) {
            return 'arc-path contributions-path author_' + d.author_id + ' year_' + d.year;
        })
        .attr('fill', function (d) {
            return d.color;
        })
        .attr('stroke', function (d) {
            return d.color;
        })
        .style("opacity", function (d) {
            return (1);
        })
        .transition()
        .on("end", myCallback)
        .delay(function (d, i) {
            return element_duration + i * single_duration;
        })
        .duration(element_duration)
        .attrTween("d", tweenPieContributions);

    /*g.append('svg:path')
        .attr('class', 'arc-path')
        .attr('fill', "#00f000")
        .attr('stroke', "#00f000")
        .transition()
        .delay(function (d, i) {
            return 200 + i * 20;
        })
        .duration(200)
        .attrTween("d", tweenPieLines)*/

    lines_arc = svg.selectAll('path.lines-path')
        .data(years).enter()
        .append("g").append('svg:path')
        .on('mouseover', yearMouseOver)
        .on('mouseout', yearMouseOut)
        .attr('class', function (d, i) {
            return 'years-path year_' + d.year + " " + d.authors;
        })
        .attr('fill', function (d) {
            return d['color'];
        })
        .attr('stroke', function (d) {
            return d['color'];
        })
        .transition()
        .ease(d3.easeLinear)
        .delay(function (d) {
            return element_duration + (d.times - d._times) * single_duration;
        })
        .duration(function (d) {
            return single_duration * d['_times'];
        })
        .attrTween("d", tweenPieLines);


    svg.append("text")
        .attr("class", "center_text")
        .attr("text-anchor", "middle")
        .attr('font-size', '1.1em')
        .style('fill', '#34495e')
        .attr('y', -45)
        .attr("fill-opacity", 0).transition().delay(100).duration(1000)
        .attr("fill-opacity", 1)
        .text("34123");

    svg.append("text")
        .attr("class", "percent_text")
        .attr("text-anchor", "middle")
        .attr('font-size', '3em')
        .style("font-weight", 'bold')
        .style('fill', '#34495e')
        .attr('y', 12)
        .attr("fill-opacity", 0).transition().delay(100).duration(1000)
        .attr("fill-opacity", 1)
        .text("99%");

    svg.append("text")
        .attr("class", "info_text1")
        .attr("text-anchor", "middle")
        .attr('font-size', '0.9em')
        .style('fill', '#34495e')
        .attr('y', 37)
        .attr("fill-opacity", 0).transition().delay(100).duration(1000)
        .attr("fill-opacity", 1)
        .text("completed.");

    svg.append("text")
        .attr("class", "info_text2")
        .attr("text-anchor", "middle")
        .attr('font-size', '0.9em')
        .style('fill', '#34495e')
        .attr('y', 57)
        .attr("fill-opacity", 0)
        .text("Completed");

    svg.append("text")
        .attr("class", "info_text3")
        .attr("text-anchor", "middle")
        .attr('font-size', '0.7em')
        .style("font-weight", 'bold')
        .style('fill', '#34495e')
        .attr('y', 75)
        .attr("fill-opacity", 0)
        .text("rank: 1/293");

    var gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color",getRandomColor(1-1/130))
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color",   getRandomColor(1-87/130))
        .attr("stop-opacity", 1);

    var signs = d3.select('svg').append("g").attr("class", "signs");
    var rectangle = signs
        .append("rect")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 20)
        .attr("height", 100)
        .style("fill", "url(#gradient)");

    signs.append("text")
        .attr("text-anchor", "left")
        .attr('font-size', '0.7em')
        .style("font-weight", 'bold')
        .style('fill', '#34495e')
        .attr('y', 120)
        .attr('x', 50)
        .text("87");

    signs.append("text")
        .attr("text-anchor", "left")
        .attr('font-size', '0.7em')
        .style("font-weight", 'bold')
        .style('fill', '#34495e')
        .attr('y', 30)
        .attr('x', 50)
        .text("1");

    signs.append("text")
        .attr("text-anchor", "left")
        .attr('font-size', '0.7em')
        .style("font-weight", 'bold')
        .style('fill', '#34495e')
        .attr('y', 75)
        .attr('x', 50)
        .text("Authors' Rank (from 0 to # of contributors)");


    var addedLines = signs
        .append("rect")
        .attr("x", 20)
        .attr("y", 140)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", '#139639');


    signs.append("text")
        .attr("text-anchor", "left")
        .attr('font-size', '0.7em')
        .style("font-weight", 'bold')
        .style('fill', '#139639')
        .attr('y', 155)
        .attr('x', 50)
        .text("Added Lines.");

    var removedLines = signs
        .append("rect")
        .attr("x", 20)
        .attr("y", 180)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", '#e2120c');


    signs.append("text")
        .attr("text-anchor", "left")
        .attr('font-size', '0.7em')
        .style("font-weight", 'bold')
        .style('fill', '#e2120c')
        .attr('y', 195)
        .attr('x', 50)
        .text("Removed Lines.");

    for(var i = 0; i<years.length; i++){
        var year = signs
            .append("rect")
            .attr("x", 20)
            .attr("y", 220 + (20*i))
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", years[i].color);
        signs.append("text")
            .attr("text-anchor", "left")
            .attr('font-size', '0.6em')
            .style("font-weight", 'bold')
            .style('fill', '#34495e')
            .attr('y', 233 + (20*i))
            .attr('x', 45)
            .text(years[i].year);

    }
    signs.    attr("fill-opacity", 0).transition().duration(500).attr("fill-opacity", 1);


}

function tweenPieLines(b, i) {
    b.startAngle = (b.times - b._times) * step;
    b.endAngle = b.times * step;
    var w = d3.interpolate({startAngle: (b.times - b._times) * step, endAngle: (b.times - b._times) * step}, b);
    return function (t) {
        return drawLinesArc(w(t));
    };
}

function tweenPieContributions(b) {
    b.innerRadius = 0;
    var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
    return function (t) {
        return drawArc(i(t));
    };
}

function tweenPieDeletions(b) {
    b.outerRadius = radius + (b.author_norm_additions * additions_radius);
    var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
    return function (t) {
        return drawDeletionsArc(i(t));
    };
}

function tweenPieAdditions(b) {
    b.outterRadius = radius;
    var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
    return function (t) {
        return drawAdditionsArc(i(t));
    };
}

function tweenDonutDeletions(b) {
    b.outerRadius = radius + (b.author_norm_additions * additions_radius) + (deletions_radius * b.author_norm_deletions);
    var i = d3.interpolate({outerRadius: radius + (b.author_norm_additions * additions_radius)}, b);
    return function (t) {
        return drawDeletionsArc(i(t));
    };
}

function tweenDonutAdditions(b) {
    b.outerRadius = radius;
    var i = d3.interpolate({outerRadius: radius + (b.author_norm_additions * additions_radius)}, b);
    return function (t) {
        return drawDeletionsArc(i(t));
    };
}


allData();

var drawArc = d3.arc()
    .outerRadius(function (d) {
        return radius - 3;
    })
    .innerRadius(radius - usersArcWidth)
    .startAngle(function (d) {
        return d.index * step;
    })
    .endAngle(function (d) {
        return (d.index + 1) * step;
    });

var drawLinesArc = d3.arc()
    .outerRadius(function (d) {
        return radius - usersArcWidth - 3;
    })
    .innerRadius(radius - usersArcWidth - 3 - usersArcWidth);

var drawAdditionsArc = d3.arc()
    .innerRadius(radius)
    .startAngle(function (d) {
        return d.index * step;
    })
    .endAngle(function (d) {
        return (d.index + 1) * step;
    });

var drawDeletionsArc = d3.arc()
    .innerRadius(function (d) {
        return radius + (d.author_norm_additions * additions_radius);
    })
    .startAngle(function (d) {
        return d.index * step;
    })
    .endAngle(function (d) {
        return (d.index + 1) * step;
    });

var svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
