// #access_token=799895.ea88e3c.716e004addb642e0b36407c167b289de

var w = 960;
var h = 350;
var barPadding = 1;
var svg = d3.select('body')
            .append('svg')
            .attr('width', w)
            .attr('height', h);

var omittedWords = ['', 'a', 'and', 'then', 'i\'m', 'in', 'on', 'for',
                    'out', 'with', 'can', 'can\'t', 'this', 'over', 'under',
                    'be', 'more', 'less', 'why', 'not', 'you', 'me', 'that',
                    'is', 'i', 'the', 'so', 'he', 'she', 'it', 'of', 'to',
                    'my'];

// redirected from Instagram Auth
if (window.location.hash) {
    document.getElementById('auth-btn').style.display = 'none';
    INSTAGRAM.init();
    // async
    promise.join([
        INSTAGRAM.getUserPosts,
        INSTAGRAM.getLiked
    ]).then(processPhotos);
}

function processPhotos(errors, values) {
    var captions = [];
    for (var i=0; i<2; i++) {
        if (errors[i]) {
            return console.log('[processPhotos] Error!');
        }
        captions = captions.concat(grabCaptions(values[i].data));
    }
    var sorted = wordSort(captions);
    drawCommonWordGraph(sorted.slice(0, 20));
}

function grabCaptions(photo) {
    // grab all caption text
    return _.chain(photo).map(function (photo) {
        //return steelToe(photo).get('caption.text');
        return steelToe(photo).get('tags').join(' ');
    }).compact().value();
}

function wordSort(captions) {
    return _.chain(captions)
            .map(function(caption) {
                caption = caption.replace(/[\.|\,|\ |\!]+/gi, ' ');
                return caption.split(' ');
            })
            .flatten()
            .invoke(String.prototype.toLowerCase)
            .countBy(function(word) { return word; })
            .omit(omittedWords)
            .pairs()
            .sortBy(function(arr) {
                // reverse sort
                return -arr[1];
            })
            .value();
}

function handleSearch (data, i) {
    var tag = data[0];
    INSTAGRAM.search(tag);
}

// DRAWING =====================================
function drawCommonWordGraph (dataset) {
    var baseline = 100,
        diameter = 500;
        sepFactor = 1.3;

    var defs = svg.append("defs")

    var wbWidth = 500;
    var wbCenter = { x: wbWidth / 2, y: h / 2 };

    // use forces to make elastic effect
    var force = d3.layout.force().size([wbWidth, h]);
    force.nodes(dataset);
    // assign random location to start with
    force.nodes().forEach( function(d, i) {
        d.x = Math.random() * wbWidth;
        d.y = Math.random() * h;
    });
    // gather nodes
    var clouds = svg.selectAll('circle').data(force.nodes());
    // gather labels
    var labels = svg.selectAll('text').data(force.nodes());

    // initial parameters
    var node = clouds
                .enter().append('circle')
                .attr('class', 'tag-bubble')
                .attr('r',      function (d) { return d[1] * 7; })
                .attr('cx',     function (d) { return d.x; })
                .attr('cy',     function (d) { return d.y; })
                .attr('fill',   function (d) {
                    return "hsl(20, "+ d[1]*10 +"%, 61%)";
                })
                .attr('opacity', function (d) {
                    return Math.max(d[1] / 13, 0.4);
                })
                // toggle label over item
                .on('mouseover', function (d, i) {
                    d3.select('#label-' + i).attr('display', 'inline');
                })
                .on('mouseout', function (d, i) {
                    d3.select('#label-' + i).attr('display', 'none');
                })
                .on('click', handleSearch);

    var text = labels
                .enter().append('text')
                .text(function(d)           { return "#" + d[0]; })
                .attr('x', function(d, i)   { return d.x; })
                .attr('y', function(d)      { return d.y; })
                .attr('id', function(d, i) { return 'label-' + i; })
                .attr('font-family', 'sans-serif')
                .attr('font-size', '11px')
                .attr('fill', '#fff')
                .attr('display', 'none')
                .attr('text-anchor', 'middle')
                .attr('pointer-events', 'none');

    // thanks to: http://vallandingham.me/vis/gates/ for
    // the idea of using force for elastic grouping
    force
        .gravity(-0.01)
        // separate circles from one another
        .charge( function(d) {
            var val = d[1] * 5;
            return -(val*val) / sepFactor;
        })
        .friction(0.9)
        .on('tick', function(e) {
            moveCenter(e.alpha);
            node
                .attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; });
            text
                .attr('x', function(d) { return d.x; })
                .attr('y', function(d) { return d.y; });

        }).start();

    function moveCenter( alpha ) {
        force.nodes().forEach(function(d) {
            d.x = d.x + (wbCenter.x - d.x) * (0.2 + 0.02) * alpha;
            d.y = d.y + (wbCenter.y - d.y) * (0.2 + 0.02) * alpha;
        });
    }


    // MAP
    var projection = d3.geo.mercator()
                       .scale(200)
                       .center([9.1021, 18.28])
                       .translate([w / 2, h / 2 + 400])
                       .precision(0.1);
    var path = d3.geo.path()
                 .projection(projection);

    var mapContainer = svg.append("g")
                          .attr("id", "mapContainer")
                          .attr("transform", "translate("+wbWidth+", 0) scale(0.4)");

    d3.json("data/world-50m.json", function(err, world) {
        mapContainer.insert("path", ".graticule")
            .datum(topojson.object(world, world.objects.land))
            .attr("class", "land")
            .attr("d", path);

        mapContainer.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
            .attr("class", "boundary")
            .attr("d", path);

        mapContainer.append("circle")
           .attr("r", 5)
           .attr("fill", "red")
           .attr("transform", function() {
                return "translate(" + projection([-75,43]) + ")";
           });
    });
}