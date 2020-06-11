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
	}
}