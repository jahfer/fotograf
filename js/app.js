// #access_token=799895.ea88e3c.716e004addb642e0b36407c167b289de

var w = 960;
var h = 300;
var barPadding = 1;
var svg = d3.select('body')
            .append('svg')
            .attr('width', w)
            .attr('height', h);

var omittedWords = ['', 'a', 'and', 'then', 'this', 'is', 'i', 'the', 'so', 'he', 'she', 'it', 'of', 'to', 'my'];
// redirected from Instagram Auth
if (window.location.hash) {
    document.getElementById("auth-btn").style.display = "none";
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
    drawCommonWordGraph(sorted);
}

function grabCaptions(photo) {
    // grab all caption text
    return _.chain(photo).map(function (photo) {
        return steelToe(photo).get('caption.text');
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

    svg.selectAll('rect')
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
            .attr("x", function(d, i) {
                d.cx = (i * (w / dataset.length) + (w / dataset.length - barPadding) / 2) + 4;
                return d.cx;
            })
            .attr("y", function(d) {
                d.cy = baseline + 10;
                return d.cy;
            })
            .attr("transform", function(d, i) {
                return "rotate(-90 "+d.cx+", "+d.cy+")";
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "#888")
            .attr("text-anchor", "end");
}