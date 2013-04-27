// #access_token=799895.ea88e3c.716e004addb642e0b36407c167b289de

var w = 500;
var h = 300;
var center = { x: w / 2, y: h / 2 };
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

    _.each(sorted, function(tag) {
        //INSTAGRAM.search(tag);
    });
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

// DRAWING =====================================
function drawCommonWordGraph (dataset) {
    var baseline = 100;
    var diameter = 500;

    var force = d3.layout.force().size([w, h]);
    force.nodes(dataset);

    force.nodes().forEach( function(d, i) {
        d.x = Math.random() * w;
        d.y = Math.random() * h;
    });

    var clouds = svg.selectAll('circle')
                .data(force.nodes());

    var node = clouds
                    .enter().append('circle')
                    .attr('r', function(d) {
                        return d[1] * 5;
                    })
                    .attr('cx', function(d) {
                        return d.x;
                    })
                    .attr('cy', function(d) {
                        return d.y;
                    })
                    .attr('fill', 'red')
                    .on('mouseover', function(d, i) {
                        d3.select('#label-' + i).attr('display', 'inline');
                    })
                    .on('mouseout', function (d, i) {
                        d3.select('#label-' + i).attr('display', 'none');
                    });

    var labels = svg.selectAll('text').data(force.nodes());

    var label = labels
                    .enter().append('text')
                    .text(function(d)           { return "#" + d[0]; })
                    .attr('x', function(d, i)   { return d.x; })
                    .attr('y', function(d)      { return d.y; })
                    .attr('id', function(d, i) { return 'label-' + i; })
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', '11px')
                    .attr('fill', '#000')
                    .attr('display', 'none')
                    .attr('text-anchor', 'middle')
                    .attr('pointer-events', 'none');

    force
        .gravity(-0.01)
        .charge( function(d) {
            var val = d[1] * 5;
            return -(val*val) / 2.3;
        })
        .friction(0.9)
        .on('tick', function(e) {
            moveCenter(e.alpha);
            node
                .attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; });
            label
                .attr('x', function(d) { return d.x; })
                .attr('y', function(d) { return d.y; });

        }).start();

    // Generates a gravitational point in the middle
    function moveCenter( alpha ) {
        force.nodes().forEach(function(d) {
            d.x = d.x + (center.x - d.x) * (0.2 + 0.02) * alpha;
            d.y = d.y + (center.y - d.y) * (0.2 + 0.02) * alpha;
        });
    }

    /*svg.selectAll('rect')
        .data(dataset)
        .enter().append('rect')
            .attr('x', function(d, i) {
                return i * (w / dataset.length);
            })
            .attr('y', function(d) {
                return baseline - (d[1] * 10);
            })
            .attr('width', w / dataset.length - barPadding)
            .attr('height', function(d) {
                return d[1] * 10;
            })
            .attr('fill', function(d) {
                return 'rgb(0, 0, ' + (d[1] * 25) + ')';
            });

    svg.selectAll('text')
        .data(dataset)
        .enter().append('text')
            .text(function(d) {
                return d[0];
            })
            .attr('x', function(d, i) {
                d.cx = (i * (w / dataset.length) + (w / dataset.length - barPadding) / 2) + 4;
                return d.cx;
            })
            .attr('y', function(d) {
                d.cy = baseline + 10;
                return d.cy;
            })
            .attr('transform', function(d, i) {
                return 'rotate(-90 '+d.cx+', '+d.cy+')';
            })
            .attr('font-family', 'sans-serif')
            .attr('font-size', '11px')
            .attr('fill', '#888')
            .attr('text-anchor', 'end');*/
}