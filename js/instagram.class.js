var INSTAGRAM = (function() {

    // === | PRIVATE =======================================
    var _parseToken = /^#access_token\=(.*)$/;
    var _accessToken;
    var _userInfo = _api('users/self');

    function _api(uri) {
        return function(callback) {
            reqwest({
                url: 'https://api.instagram.com/v1/' + uri + '/?access_token=' + _accessToken,
                type: 'jsonp',
                success: callback
            });
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

    var getUserPosts = function(callback) {
        _userInfo(function(result) {
            var userId = result.data.id;
            var userFeed = _api('users/' + userId + '/media/recent');
            userFeed(callback);
        });
    };

    return {
        init: getTokenFromHash,
        getUserPosts: getUserPosts,
        getLiked: getLiked
    };
})();