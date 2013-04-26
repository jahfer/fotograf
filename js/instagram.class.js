var INSTAGRAM = (function() {
	var _parseToken = /^#access_token\=(.*)$/;
	var _accessToken;

	function getTokenFromHash() {
		var hash = window.location.hash;
		if (hash) {
			var token = _parseToken.exec(hash);
			_accessToken = token[1];
		}
	}

	function _api(uri) {
		return function(callback) {
			reqwest({
				url: "https://api.instagram.com/v1/"+uri+"/?access_token=" + _accessToken,
				type: 'jsonp',
				success: callback
			});
		};
	}

	var _userInfo = _api("users/self");
	var getLiked = _api("users/self/media/liked");

	var getUserPosts = function(callback) {
		var userObj = _userInfo(function(result) {
			var fetch = _api("users/" + userId + "/media/recent");
		});
	};

	/*function _userInfo(callback) {
		reqwest({
			url: "https://api.instagram.com/v1/users/self?access_token=" + _accessToken,
			type: 'jsonp',
			success: callback
		});
	}*/

	/*function asyncLiked(callback) {
		reqwest({
			url: 'https://api.instagram.com/v1/users/self/media/liked/?access_token=' + _accessToken + '&callback=?',
			type: 'jsonp',
			success: callback
		});
	}*/

	return {
		getTokenFromHash: getTokenFromHash,
		getUserPosts: getUserPosts,
		getLiked: getLiked
	};
})();