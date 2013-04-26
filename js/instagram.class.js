var INSTAGRAM = (function() {

    // === | PRIVATE =====================================
    var _parseToken = /^#access_token\=(.*)$/;
    var _accessToken;
    var _userInfo = _api('users/self');

    function _api(uri) {
        return function() {
            var p = new promise.Promise();
            reqwest({
                url: 'https://api.instagram.com/v1/' + uri + '/?access_token=' + _accessToken,
                type: 'jsonp',
                success: function(result) {
                    p.done(null, result);
                }
            });
            return p;
        };
    }

    // === | PUBLIC =======================================
    function getTokenFromHash() {
        var hash = window.location.hash;
        if (hash) {
            var token = _parseToken.exec(hash);
            _accessToken = token[1];
        }
    }
    var getLiked  = _api('users/self/media/liked');

    var getUserPosts = function() {
        var p = new promise.Promise();
        _userInfo().then(function(err, result) {
            if (err) {
                console.log("[getUserPosts] Error!");
            }
            var userId = result.data.id;
            var userFeed = _api('users/' + userId + '/media/recent');
            userFeed().then(function(err, result) { p.done(null, result); });
        });
        return p;
    };

    // === | ACCESSORS ===================================
    return {
        init: getTokenFromHash,
        getUserPosts: getUserPosts,
        getLiked: getLiked
    };
})();