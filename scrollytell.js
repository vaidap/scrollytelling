// requires d3.js

var scrollytell = {

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

		// append svg object to container
		var svg = d3.select(graph_selector).html('')
					.append("svg")
	 			    .attr("width", width + margin.left + margin.right)
	                .attr("height", height + margin.top + margin.bottom)
	                .append("g")
	                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	    // Show the X scale
		var x = d3.scaleLinear()
		  .domain([0,24])
		  .range([0, width])

		svg.append("g")
		  .attr("transform", "translate(0," + height + ")")
		  .call(d3.axisBottom(x))

	    return [svg, x];

	},

	//TODO graph refers to svg while graph_id actually refers to the boxplot ID in it, need to refactor
	add_boxplot: function(graph, graph_id, settings, data, x) {

		//TODO refactor this, maybe just rename all

		// for less words later
		margin = settings.margin;
		width = settings.width;
		height = settings.height;
		line_height = settings.line_height;
		center = settings.center;

		// Show the main vertical line
		graph
		.append("line")
		  .attr("class", "vert-line")
		  .attr("id", graph_id + "-vert-line")
		  .attr("x1", x(data.min))
		  .attr("x2", x(data.min))
		  .attr("y1", center )
		  .attr("y2", center )
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)

		// Show the box
		graph
		.append("rect")
		  .attr("id", graph_id + "-rect")
		  .attr("x", x(data.q1) )
		  .attr("y",  center - line_height)
		  .attr("height", line_height)
		  .attr("width", (x(data.q3)-x(data.q1)))
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)
		  .style("fill", "#69b3a2")

		graph.append("line")
		  .attr("class", "min-line")
		  .attr("id", graph_id + "-min")
		  .attr("x1", x(data.min))
		  .attr("x2", x(data.min))
		  .attr("y1", center-line_height/2)
		  .attr("y2", center+line_height/2)
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)

		graph.append("line")
		  .attr("class", "median-line")
		  .attr("id", graph_id + "-med")
		  .attr("x1", x(data.median))
		  .attr("x2", x(data.median))
		  .attr("y1", center-line_height/2)
		  .attr("y2", center+line_height/2)
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)

		graph.append("line")
		  .attr("class", "max-line")
		   .attr("id", graph_id + "-max")
		  .attr("x1", x(data.max))
		  .attr("x2", x(data.max))
		  .attr("y1", center-line_height/2)
		  .attr("y2", center+line_height/2)
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)


		graph.append("line")
		  .attr("class", "q1-line")
		  .attr("id", graph_id + "-q1-line")
		  .attr("x1", x(data.q1))
		  .attr("x2", x(data.q3))
		  .attr("y1", center-line_height/2)
		  .attr("y2", center+line_height/2)
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)

		graph.append("line")
		  .attr("class", "q3-line")
		  .attr("id", graph_id + "-q3-line")
		  .attr("x1", x(data.q1))
		  .attr("x2", x(data.q3))
		  .attr("y1", center-line_height/2)
		  .attr("y2", center+line_height/2)
		  .attr("stroke", "grey")
		  .attr("stroke-width", 3)

	},

	// TODO this has to target the specific ID of the graph inside the svg
	update_svg: function(graph, data, x, center, line_height) {

	  graph.select("rect")
	    .transition()
	    .duration(1000)
	    .attr("x", x(data.q1))
	    .attr("y",  center - line_height/2)
	    .attr("height", line_height)
	    .attr("width", (x(data.q3)-x(data.q1)))

	  graph.select("line.vert-line")
	    .transition()
	    .duration(1000)
	    .attr("x1", x(data.min))
	    .attr("x2", x(data.max))

	  graph.select("line.min-line")
	    .transition()
	    .duration(1000)
	    .attr("x1", x(data.min))
	    .attr("x2", x(data.min))

	  graph.select("line.median-line")
	    .transition()
	    .duration(1000)
	    .attr("x1", x(data.median))
	    .attr("x2", x(data.median))

	  graph.select("line.max-line")
	    .transition()
	    .duration(1000)
	    .attr("x1", x(data.max))
	    .attr("x2", x(data.max))

	  graph.select("line.q1-line")
	    .transition()
	    .duration(1000)
	    .attr("x1", x(data.q1))
	    .attr("x2", x(data.q1))

	  graph.select("line.q3-line")
	    .transition()
	    .duration(1000)
	    .attr("x1", x(data.q3))
	    .attr("x2", x(data.q3))

	}

}