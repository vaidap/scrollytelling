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
	}

	// TODO components
	// data comic
	// data table
	// construction
}