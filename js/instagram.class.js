var INSTAGRAM = (function() {

    // === | PRIVATE =====================================
    var _parseToken = /^#access_token\=(.*)$/;
    var _accessToken;
    var _userInfo = _api('users/self');
    var _userData = {};

    // function factory
    function _api(uri) {
        return function() {
            var p = new promise.Promise();
            reqwest({
                url: 'https://api.instagram.com/v1/' + uri + '/?access_token=' + _accessToken,
                type: 'jsonp',
                success: function(result) { p.done(null, result); }
            });
            return p;
        };
    }

    function _getTokenFromHash() {
        var hash = window.location.hash;
        if (hash) {
            var token = _parseToken.exec(hash);
            _accessToken = token[1];
        }
    }

    // === | PUBLIC =======================================
    function init() {
        _getTokenFromHash();
        var p = new promise.Promise();
        _userInfo().then(function(err, result) {
            if (err) {
                return console.log("[UserData] Error!");
            }
            _userData = result.data;
            p.done(null, true);
        });
        return p;
    }

    function getUserData() {
        return _userData;
    }

    var getLiked  = _api('users/self/media/liked');

    var getUserPosts = function() {
        var userId = _userData.id;
        var userFeed = _api('users/' + userId + '/media/recent');
        return userFeed();
    };

    var search = function(term) {
        return _api("tags/"+term+"/media/recent")();
    };

    // === | ACCESSORS ===================================
    return {
        init: init,
        getUserPosts: getUserPosts,
        getLiked: getLiked,
        search: search,
        getUserData: getUserData
    };
})();