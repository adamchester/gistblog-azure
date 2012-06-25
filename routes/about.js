
var request = require('request');


var About = function() {

	/*
	 * GET /about page.
	 */
	this.index = function(req, res) {
		res.render('abouts/index', { title: 'About' });
	};

};

exports.About = new About();
