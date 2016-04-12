var _ = require('lodash');

var Matcher = function() {
	this._matchers = [];
}

Matcher.prototype.add = function(criteria, userdata) {
	this._matchers.push( {criteria: this._makeRegEx(criteria), data:userdata||true});
};

Matcher.prototype.match = function(string) {
	var matches = [];
	_.forEach(this._matchers, function(matcher) {
		if(string.match(matcher.criteria)) {
			matches.push(matcher.data);
		}
	});
	return matches;
};

Matcher.prototype._makeRegEx = function(criteria) {
	var re = '^'+this._pregQuote(criteria).replace(/\\\*/g, '.*').replace(/\\\?/g, '.') + '$';
    return new RegExp(re, 'g');
};

Matcher.prototype.isWildcardChannel = function(str) {
    return str.indexOf('*')>=0 || str.indexOf('?')>=0;
}

Matcher.prototype._pregQuote = function(str, delimiter) {
    // http://kevin.vanzonneveld.net
    // +   original by: booeyOH
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: preg_quote("$40");
    // *     returns 1: '\$40'
    // *     example 2: preg_quote("*RRRING* Hello?");
    // *     returns 2: '\*RRRING\* Hello\?'
    // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
};

module.exports = Matcher;