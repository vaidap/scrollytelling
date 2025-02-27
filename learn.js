// requires d3.js

var learn = {

	// class_name: class added to text
	// vis: visualisation to highlight
	// vis_selector: element to highlight

	// TODO:
	// allow selection of stroke or fill, colour, width
	// add specifics on how to set this up (eg. hoverable text)

	hover_text: function(class_name, vis, vis_selector) {
	
		let elem = document.getElementsByClassName(class_name);

		elem[0].addEventListener("mouseenter", function( event ) {   

			vis.select(vis_selector)
			.attr("stroke", "blue")
			.style("stroke-width", 5)

		}, false);

		elem[0].addEventListener("mouseleave", function( event ) {   

			vis.select(vis_selector)
			.attr("stroke", "black")
			.style("stroke-width", 1)

		}, false);
	},

	// refactor using this?
	// d3.select("#circleBasicTooltip")
	 //  .on("mouseover", function(){return tooltip.style("visibility", "visible");})
	 //  .on("mousemove", function(){return tooltip.style("top", (event.pageY-800)+"px").style("left",(event.pageX-800)+"px");})
	 //  .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

	// TODO components
	// data comic
	// data table
	// construction

	//TODO sections not highlighted if you click on links
	// scrolling back up, sandbox is not highlighted

	// section_id: id of the part of the timeline we are now at
	set_timeline_section: function(section_id) {
 		
 		document.getElementsByClassName("part-current")[0].classList.remove("part-current");
        var part = document.getElementById(section_id);
        part.classList.add("part-current");
	},

	//TODO make margins editable as well
	// graph_id refers to "svg3","svg4" etc
	init_svg: function(graph_selector, settings) {

		// for less words later
		margin = settings.margin;
		width = settings.width;
		height = settings.height;
		line_height = settings.line_height;
		center = settings.center;
		x_domain = settings.x_domain;

		// append svg object to container
		var svg = d3.select(graph_selector).html('')
					.append("svg")
	 			    .attr("width", width + margin.left + margin.right)
	                .attr("height", height + margin.top + margin.bottom)
	                // .style("background-color", "#f4f4f4")
	                .append("g")
	                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	    if (settings.orientation == "horizontal") {
	    	start_range = 0;
	    	end_range = width;
	    }
	    else if (settings.orientation == "vertical") {
	    	start_range = 80;
	    	end_range = height - 40;
	    }
	    // Show the X scale
		var x = d3.scaleLinear()
		  .domain(x_domain)
		  .range([start_range, end_range])

	    return [svg, x];

	},

	// TODO change others to also use graph_id (so it's 0 for container-0 #graph etc)
	init_story: function(graph_id, settings, timeline_section) {

	  var svg = d3.select('.container-' + graph_id + ' #graph').html('')
	    .append('svg')
	    .attrs({width: settings.width, height: settings.height});

	    svg.append("rect")
	    .attr("width", "100%")
	    .attr("height", "100%")
	    .attr("fill", "white");
	 
	  return d3.graphScroll()
	  	  .offset(300) // sets the offset overall
	      .container(d3.select('.container-' + graph_id))
	      .graph(d3.selectAll('.container-' + graph_id + ' #graph'))
	      .eventId('uniqueId' + graph_id)  // namespace for scroll and resize events
	      .sections(d3.selectAll('.container-' + graph_id + ' #sections > div'))
	      .on('active', function(i){
	        // transitions
	        svg.append("svg:image")
	        .attr('x', -9)
	        .attr('y', -12)
	        .attr('width', 500)
	        .attr('height', 500)
	        .attr("xlink:href", "images/" + settings.images[i] + ".png")

			learn.set_timeline_section(timeline_section);
	      })
	},

	show_scale: function(graph, settings, x) {

		if (settings.orientation == "horizontal") {

			height = settings.height - 15; // to have space for legend
			
			graph.append("g")
			  .attr("class", "scale")
			  .attr("transform", "translate(0," + height + ")")
			  .call(d3.axisBottom(x))

			graph.append("text").attr("x", settings.width/2.5).attr("y", settings.height + 25).text(settings.graph_axis).style("font-size", "14px");
			graph.append("text").attr("x", settings.width/3).attr("y", 25).text(settings.graph_title).style("font-size", "18px").style("text-decoration", "underline");

	    }
	    else if (settings.orientation == "vertical") {

			width = settings.width + 15; // to have space for legend
			
			graph.append("g")
			  .attr("class", "scale")
			  .attr("transform", "translate(" + 50 + ", 0)")
			  .call(d3.axisLeft(x))

			graph.append("text").attr("x", 30).attr("y", settings.height - 5).text(settings.graph_axis).style("font-size", "14px");
			graph.append("text").attr("x", settings.width/3).attr("y", 25).text(settings.graph_title).style("font-size", "18px").style("text-decoration", "underline");
	    }


	},

	// Compute summary statistics used for the box
	calculate_stats: function(data) {

		var data_sorted = Array.from(data) // turns out just doing b = a does a shallow copy, so all of the operations below act on original array as well!
		data_sorted = data_sorted.sort(d3.ascending)
		var q1 = d3.quantile(data_sorted, .25)
		var median = d3.quantile(data_sorted, .5)
		var q3 = d3.quantile(data_sorted, .75)
		var interQuantileRange = q3 - q1
	    var min = Math.min(...data_sorted)
	    var max = Math.max(...data_sorted)

		return stats = {
		  q1: q1,
		  median: median,
		  q3: q3,
		  interQuantileRange: interQuantileRange,
		  min: min,
		  max: max
		};
	},

	make_visible: function(graph, element, state) {

		if (state == false) {
			graph.select("." + element).transition().duration(1000).style("opacity", 0);
		}
		else if (state == true) {
			graph.select("." + element).transition().duration(1000).style("opacity", 1);
		}
		

	},

	//TODO graph refers to svg while graph_id actually refers to the boxplot ID in it, need to refactor
	//TODO add offset
	add_boxplot: function(graph, graph_id, settings, data, x, graph_title="", offset=0) {

		//TODO refactor this, maybe just rename all

		// for less words later
		margin = settings.margin;
		width = settings.width;
		height = settings.height;
		line_height = settings.line_height;
		center = settings.center;

		// TODO add an id to these, and make text editable, in show_scale as well
		if (settings.orientation == "horizontal") {
			graph.append("text").attr("x", 0).attr("y", center - offset - 35).text(graph_title).style("font-size", "16px");
		}
		else if (settings.orientation == "vertical") {
			graph.append("text").attr("x", center - 40 - offset * 1.3).attr("y", 60).text(graph_title).style("font-size", "16px");
		}

		// TODO make the naming of classes and ids consistent

		// Show the main vertical line
		graph
		.append("line")
		  .attr("class", graph_id + " vert-line") //TODO the correct thing to do here is to group all of these elements with g, so they can be manipulated together
		  .attr("id", graph_id + "-vert-line")
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)

		// Show the box
		graph
		.append("rect")
		  .attr("class", graph_id + " rect") 
		  .attr("id", graph_id + "-rect")
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)
		  .style("fill", "#69b3a2")


		graph.append("line")
		  .attr("class", graph_id + " min-line")
		  .attr("id", graph_id + "-min")
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)

		graph.append("line")
		  .attr("class", graph_id + " median-line")
		  .attr("id", graph_id + "-med")
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)

		graph.append("line")
		  .attr("class", graph_id + " max-line")
		   .attr("id", graph_id + "-max")
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)


		graph.append("line")
		  .attr("class", graph_id + " q1-line")
		  .attr("id", graph_id + "-q1-line")
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)

		graph.append("line")
		  .attr("class", graph_id + " q3-line")
		  .attr("id", graph_id + "-q3-line")
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)


		if (settings.orientation == "vertical" && settings.labels == true) {
			graph.append("text").attr("x", 240 - offset).attr("y", x(data.min)).text("Minimum").style("font-size", "16px").attr("id", graph_id + "-min-text").attr("class", graph_id + " min-text text");
			graph.append("text").attr("x", 240 - offset).attr("y", x(data.max)).text("Maximum").style("font-size", "16px").attr("id", graph_id + "-max-text").attr("class", graph_id + " max-text text");
			graph.append("text").attr("x", 240 - offset).attr("y", x(data.median)).text("Median").style("font-size", "16px").attr("id", graph_id + "-med-text").attr("class", graph_id + " med-text text");
			graph.append("text").attr("x", 240 - offset).attr("y", x(data.q1)).text("1st Quartile").style("font-size", "16px").attr("id", graph_id + "-q1-text").attr("class", graph_id + " q1-text text");
			graph.append("text").attr("x", 240 - offset).attr("y", x(data.q3)).text("3rd Quartile").style("font-size", "16px").attr("id", graph_id + "-q3-text").attr("class", graph_id + " q3-text text");
		}


		learn.update_boxplot(graph, graph_id, settings, data, x, offset);

	},

	// TODO the x, y defs are repeated in add_boxplot, maybe remove duplication
	// TODO this has to target the specific ID of the graph inside the svg
	update_boxplot: function(graph, graph_id, settings, data, x, offset=0) {

		// for less words later
		margin = settings.margin;
		width = settings.width;
		height = settings.height;
		line_height = settings.line_height;
		center = settings.center;

	    if (settings.orientation == "horizontal") {

			graph
			.select("#" + graph_id + "-vert-line")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", x(data.min))
			  .attr("x2", x(data.max))
			  .attr("y1", center - offset)
			  .attr("y2", center - offset)

			graph
			.select("#" + graph_id + "-rect")
				.transition()
	   		    .duration(1000)
				.attr("x", x(data.q1) )
			    .attr("y",  center - line_height/2 - offset)
			    .attr("height", line_height)
			    .attr("width", (x(data.q3)-x(data.q1)))

		    graph
			.select("#" + graph_id + "-min")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", x(data.min))
			  .attr("x2", x(data.min))
			  .attr("y1", center-line_height/2 - offset)
			  .attr("y2", center+line_height/2 - offset)

			graph
			.select("#" + graph_id + "-med")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", x(data.median))
			  .attr("x2", x(data.median))
			  .attr("y1", center-line_height/2 - offset)
			  .attr("y2", center+line_height/2 - offset)

			graph
			.select("#" + graph_id + "-max")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", x(data.max))
			  .attr("x2", x(data.max))
			  .attr("y1", center-line_height/2 - offset)
			  .attr("y2", center+line_height/2 - offset)

			graph
			.select("#" + graph_id + "-q1-line")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", x(data.q1))
			  .attr("x2", x(data.q1))
			  .attr("y1", center-line_height/2 - offset)
			  .attr("y2", center+line_height/2 - offset)

			graph
			.select("#" + graph_id + "-q3-line")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", x(data.q3))
			  .attr("x2", x(data.q3))
			  .attr("y1", center-line_height/2 - offset)
			  .attr("y2", center+line_height/2 - offset)

		}
		else if (settings.orientation == "vertical") {

			if (settings.labels == true) {
				graph.select("#" + graph_id + "-min-text").transition().duration(1000).attr("y", x(data.min));
				graph.select("#" + graph_id + "-max-text").transition().duration(1000).attr("y", x(data.max));
				graph.select("#" + graph_id + "-med-text").transition().duration(1000).attr("y", x(data.median));
				graph.select("#" + graph_id + "-q1-text").transition().duration(1000).attr("y", x(data.q1));
				graph.select("#" + graph_id + "-q3-text").transition().duration(1000).attr("y", x(data.q3));
			}

			graph
			.select("#" + graph_id + "-vert-line")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", center - offset)
			  .attr("x2", center - offset)
			  .attr("y1", x(data.min))
			  .attr("y2", x(data.max))

			graph
			.select("#" + graph_id + "-rect")
				.transition()
	   		    .duration(1000)
				.attr("x", center - line_height/2 - offset)
			    .attr("y", x(data.q3)) // normally q1, see above
			    .attr("height", (x(data.q1)-x(data.q3))) // normally q3 - q1, bigger y is lower when using scale, so bigger number is actually x(q1)
			    .attr("width", line_height)

			graph
			.select("#" + graph_id + "-min")
		      .transition()
	   		  .duration(1000)
			  .attr("x1", center-line_height/2 - offset)
			  .attr("x2", center+line_height/2 - offset)
			  .attr("y1", x(data.min))
			  .attr("y2", x(data.min))

			graph
			.select("#" + graph_id + "-med")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", center-line_height/2 - offset)
			  .attr("x2", center+line_height/2 - offset)
			  .attr("y1", x(data.median))
			  .attr("y2", x(data.median))

			graph
			.select("#" + graph_id + "-max")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", center-line_height/2 - offset)
			  .attr("x2", center+line_height/2 - offset)
			  .attr("y1", x(data.max))
			  .attr("y2", x(data.max))

			graph
			.select("#" + graph_id + "-q1-line")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", center-line_height/2 - offset)
			  .attr("x2", center+line_height/2 - offset)
			  .attr("y1", x(data.q1))
			  .attr("y2", x(data.q1))

			graph
			.select("#" + graph_id + "-q3-line")
			  .transition()
	   		  .duration(1000)
			  .attr("x1", center-line_height/2 - offset)
			  .attr("x2", center+line_height/2 - offset)
			  .attr("y1", x(data.q3))
			  .attr("y2", x(data.q3))

		}

	},

	add_beeswarm: function(graph, graph_id, settings, data, x, graph_title="", offset=0) {

		margin = settings.margin;
		width = settings.width;
		height = settings.height;
		line_height = settings.line_height;
		center = settings.center;

		var formatValue = d3.format(",d");

		// var g = graph.append("g")
		// 	  .attr("class", "scale")
		// 	  .attr("transform", "translate(0," + height + ")")

	 //  	var svg = d3.select(graph_selector).html('')
		// 	.append("svg")
		// 	    .attr("width", width + margin.left + margin.right)
  //           .attr("height", height + margin.top + margin.bottom)
  //           // .style("background-color", "#f4f4f4")
  //           .append("g")
  //           .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  		// console.log(center - offset); // TODO fix offset
	    var simulation = d3.forceSimulation(data)
			.force("x", d3.forceX(width / 1.8)) // default is 2, this makes it look a bit nicer bc offset doesn't seem to work for sandbox
	    	.force("y", d3.forceY(function(d) { return x(d.value); }).strength(1.6)) // for some reason in sandbox it's not well-aligned to axis so setting strength to this specific value is a quickfix
	    	.force("collide", d3.forceCollide(6))
	    	.stop();

		for (var i = 0; i < data.length; ++i) simulation.tick();

		var countriesCircles = graph.selectAll(".countries")
			.data(data);

		countriesCircles.exit()
			.transition()
	    	.duration(1000)
	    	.attr("cx", 0)
			.attr("cy", height / 2)
			.remove();

		countriesCircles.enter()
			.append("circle")
			.attr("class", "countries")
			.attr("cx", 0)
			.attr("cy", height / 2)
			.attr("r", 5)
			.merge(countriesCircles)
			.transition()
	    	.duration(2000)
	    	.attr("cx", function(d) { return d.x + offset; })
	    	.attr("cy", function(d) { return d.y; });

		// var g = graph.append("g")
		//     .attr("transform", "translate(" + offset + ", 0)");

		//   var simulation = d3.forceSimulation(data)
		//       .force("x", d3.forceY(function(d) { return x(d.value); }).strength(5))
		//       .force("y", d3.forceX(height / 2))
		//       .force("collide", d3.forceCollide(6))
		//       .stop();

		//   for (var i = 0; i < 120; ++i) simulation.tick();

		//   var cell = g.append("g")
		//       .attr("class", "cells")
		//     .selectAll("g").data(d3.voronoi()
		//         .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.top]])
		//         .x(function(d) { return d.x; })
		//         .y(function(d) { return d.y; })
		//       .polygons(data)).enter().append("g");

		//   cell.append("circle")
		//       .attr("r", 5)
		//       .attr("cx", function(d) { return d.data.x; })
		//       .attr("cy", function(d) { return d.data.y; });

		//   cell.append("path")
		//       .attr("d", function(d) { return "M" + d.join("L") + "Z"; });

		//   cell.append("title")
		//       .text(function(d) { return d.data.id + " " + formatValue(d.data.value); });

	},

	update_beeswarm: function(graph, graph_id, settings, data, x, offset=0) {

		margin = settings.margin;
		width = settings.width;
		height = settings.height;
		line_height = settings.line_height;
		center = settings.center;

		// var simulation = d3.forceSimulation(data)
	 //      .force("x", d3.forceY(function(d) { return x(d.value); }).strength(5))
	 //      .force("y", d3.forceX(height / 2))
	 //      .force("collide", d3.forceCollide(6))
	 //      .stop();

	 //    for (var i = 0; i < 120; ++i) simulation.tick();

	 //    graph.select(".cells")
		//     .selectAll("g").data(d3.voronoi()
		//         .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.top]])
		//         .x(function(d) { return d.x; })
		//         .y(function(d) { return d.y; })
		//       .polygons(data));


		// graph.selectAll("circle")
		// 	// .data(data)
		// 	.transition(1000)
		// 	// .attr("cx", function(d) {
		// 	// 	return -130;
		// 	// })
		// 	.attr("cy", function(d) {
		// 		return x(d.data.y);
		// 	})
	},

	array_to_object: function(array) {

		var data = [];
		for(var i=0; i<array.length; i++)  {
		    data.push({id: "Value:", value: array[i]});
		}

		return data;
	},

	//TODO issue if you scroll back up and back down, it doesn't highlight elements anymore
	highlight: function(graph, element_id, state) {

		if (state == true) {
			graph.select(element_id)
	          .style("stroke", "blue")
	          .style("stroke-width", 5)
		}
		else if (state == false) {
			graph.select(element_id)
	          .style("stroke", "black")
	          .style("stroke-width", 1)
		}

	},

	add_tooltip: function(graph, element_id, value) {

	var tooltip = d3.select("body")
		.append("div")
		.style("position", "absolute")
		.style("z-index", "10")
		.style("visibility", "hidden")
		.style("color","blue")
		.style("font-size", "18px")
		.style("background-color", "white")
	    .style("border", "solid")
	    .style("border-color","blue")
	    .style("border-width", "2px")
	    .style("border-radius", "5px")
	    .style("padding", "5px")
	    .text("a simple tooltip");

	var mouseover = function(d) {
		tooltip
		  .style("visibility", "visible");
	    d3.select(this)
		  .attr("stroke", "blue")
		  .style("stroke-width", 5)

		tooltip.text(value)
	  }

	var mousemove = function(d) {
		tooltip
		  .style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px")
	}

	var mouseleave = function(d) {
		tooltip
		  .style("visibility", "hidden");
	    d3.select(this)
		  .attr("stroke", "grey")
		  .style("stroke-width", 3)
	  }


	graph.select(element_id)
		.on("mouseover", mouseover)
	    .on("mousemove", mousemove)
	    .on("mouseleave", mouseleave)
	}

}