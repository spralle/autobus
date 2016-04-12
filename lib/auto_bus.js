var assert = require('assert');

var LocalTransport = require('./local/local_transport');

var AutoBus = function(transport) {
	this._middleware = [];
	this._transport = transport || new LocalTransport(this);
}
/**
 * register middleware with layout function(err, message)
 */
AutoBus.prototype.use = function(middleware) {
	this._middleware.push(middleware);
};

/**
 * Only one listener allowed
 */
AutoBus.prototype.send = function(channel, message) {
	assert.notStrictEqual(channel, undefined);
	return this._transport.send(channel, message);
};

/**
 * pub/sub (multiple subscribers for one channel)
 */
AutoBus.prototype.publish = function(channel, message) {
	assert.notStrictEqual(channel, undefined);
	return this._transport.publish(channel, message);
};

AutoBus.prototype.join = function(channel, cb) {
	assert.notStrictEqual(channel, undefined);
	return this._transport.join(channel, cb);
}

AutoBus.prototype.leave = function(channel, cb) {
	assert.notStrictEqual(channel, undefined);
	return this._transport.leave(channel, cb);
}

AutoBus.prototype._deliver = function(message, callback) {
	var i=0;
	var self = this;
	function next(err, message) {
		var layer = self._middleware[i++];
		if(layer === undefined) {
			return callback(message);
		} else {
			return layer(message, next);
		}
	}

	next(null, message);
};

module.exports = AutoBus;