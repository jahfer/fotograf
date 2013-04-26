// #access_token=799895.ea88e3c.716e004addb642e0b36407c167b289de

var w = 500;
var h = 100;
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var commonWords = [];
var omittedWords = ["and", "my"];

// redirected from Instagram Auth
if (window.location.hash) {
    INSTAGRAM.init();
    // async
    INSTAGRAM.getUserPosts(grabCaptions);
    INSTAGRAM.getLiked(grabCaptions);

    // implement some type of promise.then()
    /*var wordList = _.map(commonWords, function(caption) {
        return caption.split(" ");
    });
    // how many times was each word said?
    var wordcount = _.countBy(wordList, function(word) { return word; });
    var cleancount = _.omit(wordcount, omittedWords);*/
}

function grabCaptions(photoList) {
    // grab all caption text
    var captions = _.map(photoList.data, function(photo) {
        return steelToe(photo).get('caption.text');
    });
    // remove all undefined items and merge into master list
    commonWords = commonWords.concat(_.compact(captions));
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