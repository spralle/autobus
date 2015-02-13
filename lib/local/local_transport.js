var _ = require('lodash');
var assert = require('assert');
var log = require('debug')('autobus:transport:local');

var Matcher = require('./matcher');

var LocalTransport = function (bus) {
	this._bus = bus;
	this._channelListeners = {};
	this._wildcardMatchers = new Matcher();
}

LocalTransport.prototype.send = function(channel, message) {
	var self = this;
	var listeners = this._getListeners(channel);
	if(listeners.length > 1) {
		log('More than one listener found');
		log(message);
		throw new Error('Can only have one matching listener when sending a message, try publish?');
	}
	if(listeners.length == 0) {
		log('No listeners found for message');
		log(message);
	}
	_(listeners).forEach(function(listener) {
		process.nextTick(function() {
			self._bus._deliver(message, listener);
		});
	});
};

LocalTransport.prototype.publish = function(channel, message) {
	var self = this;
	var listeners = this._getListeners(channel);
	if(listeners.length == 0) {
		log('No listeners found for message %s', message);
		log(message);
	}
	_(listeners).forEach(function(listener) {
		process.nextTick(function() {
			self._bus._deliver(message, listener);
			//listener(message);
		});
	});
};

LocalTransport.prototype.join = function(channel, cb) {
	if(channel.indexOf('*')>0 || channel.indexOf('?')>0) {
		this._wildcardMatchers.add(channel, cb);
	} else {
		var listeners = this._channelListeners[channel];
		if(listeners === undefined) {
			listeners = [];
			this._channelListeners[channel] = listeners;
		}
		listeners.push(cb);
	}
}

LocalTransport.prototype._getListeners = function(channel) {
	var listeners = this._channelListeners[channel] || [];
	listeners = listeners.slice();
	listeners = listeners.concat(this._wildcardMatchers.match(channel));
	return listeners;
};

module.exports = LocalTransport;