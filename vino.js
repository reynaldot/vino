var VINO_VERSION = "0.0.1";
var VINO_DEFAULT_OPTS = {
	baseUrl: 'https://api.vineapp.com/',
	debug: 0,
	deviceToken: 'Vino',
	userAgent: 'com.vine.iphone/1.01 (unknown, iPhone OS 6.0, iPad, Scale/2.000000) (Vino.js/'+VINO_VERSION+')'
};

// use browser-request if available, fall back to npm request
if (typeof request == 'undefined') {
	var request = require('request');
}

function Vino(options) {
	options = options || {};
	this.opts = extend(VINO_DEFAULT_OPTS, options);
	this.debug(this.opts);
}

Vino.prototype.debug = function(args) {
	if (this.opts.debug)
		console.log('vino', arguments);
};

Vino.prototype.homeFeed = function(callback) {
	if (!('sessionId' in this))
		throw new Error('must be logged in');
	var bu = this.opts.baseUrl, that = this;
	request(
		{
			url: bu+'timelines/graph',
			method: 'get',
			headers: {
				'vine-session-id': this.sessionId,
				'User-Agent': this.opts.userAgent
			}
		},
		function (err, resp, body) {
			that.debug('homeFeed response', err, resp, body);
			if (err) {
				callback(err, resp);
				return;
			}
			var result = jsonSafeParse(body);
			if (result.code) {
				callback('homeFeed failure', body);
			}
			callback(null, result.data);
		}
	);
};

Vino.prototype.signup = function (callback) {
	var bu = this.opts.baseUrl, that = this;
	request({
		url: bu + 'users',
		method: 'post',
		form: { 
			username: this.opts.username,
			password: this.opts.password,
			email:    this.opts.email,
			authenticate: 1
		},
		headers: {
			'User-Agent': this.opts.userAgent
		}
	},
	function (err, resp, body) {
		that.debug('signup response', err, resp, body);
		if (err) {
			callback(err, resp);
			return;
		}
		var result = jsonSafeParse(body);
		if (!result.success) {
			callback('signup failure', body);
			return;
		}
		that.sessionId = result.data.key;
		that.userId = result.data.userId;
		that.debug('session id', that.sessionId);
		callback(null, that.sessionId, that.userId, that);
	});
};

Vino.prototype.login = function(callback) {
	if (!('username' in this.opts) ||
			!('password' in this.opts))
		throw new Error('username and password required to login');
	var bu = this.opts.baseUrl, that = this;
	request(
		{
			url: bu+'users/authenticate',
			method: 'post',
			form: { 
				username: this.opts.username,
				deviceToken: this.opts.deviceToken,
				password: this.opts.password
			},
			headers: {
				'User-Agent': this.opts.userAgent
			}
		},
		function (err, resp, body) {
			that.debug('login response', err, resp, body);
			if (err) {
				callback(err, resp);
				return;
			}
      var result = jsonSafeParse(body);  
			if (!result.success) {
				return callback('login failure', body);
			}
			that.sessionId = result.data.key;
			that.userId = result.data.userId;
			that.debug('session id', that.sessionId);
			callback(null, that.sessionId, that.userId, that);
		}
	);
};

Vino.prototype.tagSearch = function(tag, qs, callback) {
	if (typeof qs === 'function' && !callback) {
		callback = qs;
		qs = {};
	}
	if (!('sessionId' in this))
		throw new Error('must be logged in');
	var bu = this.opts.baseUrl, that = this;
	request(
		{
			qs: qs,
			url: bu+'timelines/tags/'+encodeURIComponent(tag),
			method: 'get',
			headers: {
				'vine-session-id': this.sessionId,
				'User-Agent': this.opts.userAgent
			}
		},
		function (err, resp, body) {
			that.debug('tagSearch response', err, resp, body);
			if (err) {
				callback(err, resp);
				return;
			}
      var result = jsonSafeParse(body);  
			if (result.code) {
				return callback('tagSearch failure', body);
			}
			callback(null, result.data);
		}
	);
};

Vino.prototype.findTags = function(tag, qs, callback) {
	if (typeof qs === 'function' && !callback) {
		callback = qs;
		qs = {};
	}
	if (!('sessionId' in this))
		throw new Error('must be logged in');
	var bu = this.opts.baseUrl, that = this;
	request(
		{
			qs: qs,
			url: bu+'tags/search/'+encodeURIComponent(tag),
			method: 'get',
			headers: {
				'vine-session-id': this.sessionId,
				'User-Agent': this.opts.userAgent
			}
		},
		function (err, resp, body) {
			that.debug('tagSearch response', err, resp, body);
			if (err) {
				callback(err, resp);
				return;
			}
  		var result = jsonSafeParse(body);
			if (result.code) {
				return callback('tagSearch failure', body);
			}
			callback(null, result.data);
		}
	);
};

function jsonSafeParse(json) {
  var obj = {};
  try {
    obj = JSON.parse(json);
  } catch(err) {
    console.error('jsonSafeParse', err);
  }
  return obj;
}

function extend(target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i],
		keys = Object.keys(source);

		for (var j = 0; j < keys.length; j++) {
			var name = keys[j];
			target[name] = source[name];
		}
	}

	return target;
}

if (typeof module == 'undefined') 
	window.Vino = Vino;
else 
	module.exports = Vino;
