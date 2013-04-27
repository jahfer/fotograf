// #access_token=799895.ea88e3c.716e004addb642e0b36407c167b289de

var omittedWords = ['', 'a', 'and', 'then', 'i\'m', 'in', 'on', 'for',
                    'out', 'with', 'can', 'can\'t', 'this', 'over', 'under',
                    'be', 'more', 'less', 'why', 'not', 'you', 'me', 'that',
                    'is', 'i', 'the', 'so', 'he', 'she', 'it', 'of', 'to',
                    'my'];

// redirected from Instagram Auth
if (window.location.hash) {
    document.getElementById('auth-btn').style.display = 'none';
    INSTAGRAM.init().then(function(err, res) {
        var user = INSTAGRAM.getUserData();
        document.getElementById("top-user").innerHTML = user.username;
        document.getElementById("top-following").innerHTML = "Following: " + user.counts.follows;
        document.getElementById("top-followers").innerHTML = "Followers: " + user.counts.followed_by;
        document.getElementById("top-profile").src = user.profile_picture;

        // async
        promise.join([
            INSTAGRAM.getUserPosts,
            INSTAGRAM.getLiked
        ]).then(processPhotos);
    });
}

function processPhotos(errors, values) {
    // Get tags for bubble graph
    var tags = [];
    for (var i=0; i<2; i++) {
        if (errors[i]) {
            return console.log('[processPhotos] Error!');
        }
        tags = tags.concat(grabTags(values[i].data));
    }
    var sorted = wordSort(tags);
    // Draw graph
    drawCommonWordGraph(sorted.slice(0, 20));

    // Get related photos to common tags
    var publicImages = [];
    getImagesFromTags(sorted).then(function(errors, values) {
        for (var i=0; i<errors.length; i++) {
            publicImages.push(values[i].data);
        }
        var out = _.chain(publicImages)
                   .flatten()
                   .filter(function(photo) {
                        return !_.isNull(photo.location) && !_.isUndefined(photo.location.longitude);
                    })
                   .map(function(photo) { return _.pick(photo, 'link', 'location', 'images'); })
                   .value();
        // Draw map with dots
        drawMap(out);
    });
}

function grabTags(photo) {
    return _.chain(photo).map(function (photo) {
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

function getImagesFromTags(tags) {
    var images = [];

    tags = tags.slice(0, 5);

    var reqs = _.map(tags, function(d) {
        var tag = d[0];
        return function() {
            return INSTAGRAM.search(tag);
        };
    });

    return promise.join(reqs);
}

// DRAWING =====================================

var w = 960;
var h = 350;
var barPadding = 1;
var svg = d3.select('body')
            .append('svg')
            .attr('width', w)
            .attr('height', h);

var wbWidth = 500;
var wbCenter = { x: wbWidth / 2, y: h / 2 };

function drawCommonWordGraph (dataset) {
    var baseline = 100,
        diameter = 500;
        sepFactor = 2.5;

    var defs = svg.append("defs");

    var radScale = d3.scale.linear()
                     .domain([
                        d3.min(dataset, function(d) { return d[1]; }),
                        d3.max(dataset, function(d) { return d[1]; })
                     ])
                     .range([10, 50])
                     .clamp(true);

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
                .attr('r',      function (d) { return radScale(d[1]); })
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
                });

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
            var val = radScale(d[1]);
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

    function moveCenter (a) {
        force.nodes().forEach(function(d) {
            d.x = d.x + (wbCenter.x - d.x) * (0.2 + 0.02) * a;
            d.y = d.y + (wbCenter.y - d.y) * (0.2 + 0.02) * a;
        });
    }
}

function drawMap (photos) {
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

        mapContainer.selectAll("circle")
            .data(photos)
            .enter().append("circle")
                .attr("r", 4)
                .attr("fill", "red")
                .attr("transform", function(d) {
                    d.proj = projection([d.location.longitude, d.location.latitude]);
                    console.log("projection[" +d.location.latitude+","+d.location.longitude+"]");
                    return "translate(" + d.proj + ")";
                    //return "translate(" + projection([-75,43]) + ")"; // New York City
                })
                .on('mouseover', function (d, i) {
                    console.log(d.location);
                });

        /*mapContainer.append("circle")
           .attr("r", 5)
           .attr("fill", "red")
           .attr("transform", function() {
                return "translate(" + projection([-75,43]) + ")";
           });*/
    });
}