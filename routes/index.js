
/*
 * GET home page.
 */

var request = require('request'),
  _ = require('underscore'),
  lastGet = new Date(2000,1,1),
  cache = undefined;

exports.index = function(req, res){
  res.render('index', getGists() );
};

exports.about = function(req, res) {
	res.render('abouts/index', {})
};

function getGists() {

	var age = (new Date() - lastGet) / 60000;

	console.log(age);

	if (age > 5) {
		loadGistCache();
	} 

	return makeGistsModel();
};

function loadGistCache() {

	var gistListUrl = 'https://api.github.com/users/adamchester/gists';
	
	console.log('refreshing cache');

	request({ url: gistListUrl, json: true }, function (error, response, body) {
	  console.log('got response from github');

	  if (!error && response.statusCode == 200) {
	  	console.log('setting cache');

	    cache = _.chain(body)
	    		.filter(isBlogGist)
	          	.map(toViewModel)
	          	.sortBy(date)
	          	.value().reverse();

	    lastGet = new Date();
	    
	    return cache;
	  } else {
	    console.log("LOG: failed to get gists from github. Using cache.");
	    return cache;
	  }
	});
};

function makeEmptyGistsModel() { 
	return [
		{ url: 'http://loading.com/', comments: 0, description: 'Gists are being loaded, refresh the page' },
	];
};

function makeGistsModel() {
	// TODO: fix this 
	if (cache === undefined)
		return { gists: makeEmptyGistsModel() };

	return { gists: cache };
};

function isBlogGist(gist) {
	var fileName = gist.files[_(gist.files).keys()[0]].filename;
	return /blog_.+\.md/.test(fileName);
} 

function toViewModel(gist) {
	return { 
	  id: gist.id,
	  description: gist.description, 
	  created_at: new Date(gist.created_at),
	  url: 'https://gist.github.com/' + gist.id,
	  comments: gist.comments
	};
}

function date(gist) {
	return gist.created_at;
}
