// #access_token=799895.ea88e3c.716e004addb642e0b36407c167b289de

var w = 500;
var h = 100;
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var omittedWords = ["and", "my"];

// redirected from Instagram Auth
if (window.location.hash) {
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
            return console.log("[processPhotos] Error!");
        }
        captions = captions.concat(grabCaptions(values[i].data));
    }
    var listOfWords = wordsort(captions);
    console.log(listOfWords);
}

function grabCaptions(photo) {
    // grab all caption text
    var captions = _.map(photo, function (photo) {
        return steelToe(photo).get('caption.text');
    });
    // remove all undefined items
    // and return list of captions
    return _.compact(captions);
}

function wordsort(captions) {
    return _.chain(captions).map(function(caption) {
        caption = caption.replace(/[\.|\,|\ |\!]+/gi, " ");
        return caption.split(" ");
    })
    .flatten()
    .invoke(String.prototype.toLowerCase)
    .countBy(function(word) { return word; })
    .omit(omittedWords)
    .value();
    /*var words = _.map(captions, function(caption) {
        caption = caption.replace(/[\.|\,|\ |\!]+/gi, " ");
        return caption.split(" ");
    });

    var flat  = _.flatten(words);
    var lower = _.invoke(flat, String.prototype.toLowerCase);

    // how many times was each word said?
    var wordcount = _.countBy(lower, function(word) { return word; });
    return _.omit(wordcount, omittedWords);*/
}

// DRAWING =====================================

function drawTagsOverTime (result) {
    console.log("[getLiked]", result);
    svg.selectAll("circle")
        .data(result.data)
        .enter().append("circle")
            .attr("cx", function(d, i) {
                return i * 50 + 20;
            })
            .attr("cy", function(d, i) {
                return i * 20 + 20;
            })
            .attr("r", function(d) {
                return d.likes.count;
            });

    svg.selectAll("text")
        .data(result.data)
        .enter().append("text")
            .text(function(d) {
                return d.caption.text;
            })
            .attr("x", function(d, i) {
                return i * 50 + 20;
            })
            .attr("y", function(d, i) {
                return i * 20 + 20;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "red");
}