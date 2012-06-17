

var request = require('request')
	,  _ = require('underscore')
	, lastGet = new Date(2000,1,1)
	, gistListUrl = 'https://api.github.com/users/adamchester/gists'
	, adamchesterUrl = 'https://gist.github.com/adamchester'
	, viewModelCache = undefined;

/*
 * GET home page.
 */
exports.index = function(req, res){
  res.render('index', getIndexModel(gistListUrl, gistsToViewModel) );
};

exports.about = function(req, res) {
	res.render('abouts/index', { title: 'About' })
};


function getIndexModel(gistListUrl, transform) {

	console.log('loading gists from %s', gistListUrl);


	if (viewModelCache === undefined) {
		console.log("no gists loaded yet, setting empty viewModelCache");
		viewModelCache = { gists: makeEmptyGistsModel() };
	}

	request({ url: gistListUrl, json: true }, function (error, response, body) {

		console.log('got response from %s', gistListUrl);

		if (!error && response.statusCode == 200) {
			viewModelCache = transform(body);
			lastGet = new Date();
			console.log("updated viewModelCache at %s", lastGet.toLocaleString());
		} else {
			console.log("failed to get gists from %s. Using existing viewModelCache.", gistListUrl);
		}
	});

	return viewModelCache;
};

function gistsToViewModel(gists) {
	return { 
		gists: _.chain(gists).filter(isBlogGist).map(toViewModel).sortBy(date).value().reverse()
	};
};

function makeEmptyGistsModel() { 
	return [
		{ url: adamchesterUrl, created_at: new Date(), comments: 0, description: 'Gists are being loaded, refresh the page' },
	];
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
