


// EXAMPLE 3 - SCATTERPLOT

/*var dataset = [
	[ 5,     20 ],
	[ 480,   90 ],
	[ 250,   50 ],
	[ 100,   33 ],
	[ 330,   95 ],
	[ 410,   12 ],
	[ 475,   44 ],
	[ 25,    67 ],
	[ 85,    21 ],
	[ 220,   88 ]
];
var w = 500;
var h = 100;

var svg = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

svg.selectAll("circle")
	.data(dataset)
	.enter().append("circle")
		.attr("cx", function(d) {
			return d[0];
		})
		.attr("cy", function(d) {
			return d[1];
		})
		.attr("r", function(d) {
			return Math.sqrt(h - d[1]);
		});

svg.selectAll("text")
	.data(dataset)
	.enter().append("text")
		.text(function(d) {
			return d[0] + "," + d[1];
		})
		.attr("x", function(d) {
			return d[0];
		})
		.attr("y", function(d) {
			return d[1];
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "red");*/



// EXAMPLE 2 - BAR CHART
/*var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
                11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];

var w = 500;
var h = 100;
var barPadding = 1;

var svg = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

svg.selectAll("rect")
	.data(dataset)
	.enter().append("rect")
		.attr("x", function(d, i) {
			return i * (w / dataset.length);
		})
		.attr("y", function(d) {
			return h - (d * 4);
		})
		.attr("width", w / dataset.length - barPadding)
		.attr("height", function(d) {
			return d * 4;
		})
		.attr("fill", function(d) {
			return "rgb(0, 0, " + (d * 10) + ")";
		});

svg.selectAll("text")
	.data(dataset)
	.enter()
	.append("text")
	.text(function(d) {
		return d;
	})
	.attr("x", function(d, i) {
		return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
	})
	.attr("y", function(d) {
		return h - (d * 4) + 14;
	})
	.attr("font-family", "sans-serif")
	.attr("font-size", "11px")
	.attr("fill", "white")
	.attr("text-anchor", "middle");*/
