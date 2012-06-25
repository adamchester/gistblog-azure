
var request = require('request')
	,  _ = require('underscore')
	, md = require("node-markdown").Markdown
	, gists = require('../lib/gists.js')
	, gistListUrl = 'https://api.github.com/users/adamchester/gists'
;

var Posts = function() {

	this.index = function(req, res) {
		gists.getGists('adamchester', function renderCallback(gists) {
			res.render('index', gists);
		});
	};
};

exports.Posts = new Posts;
