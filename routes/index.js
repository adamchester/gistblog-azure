

var request = require('request')
	,  _ = require('underscore')
	, md = require("node-markdown").Markdown
	, lastGet = new Date(2000,1,1)
	, gistListUrl = 'https://api.github.com/users/adamchester/gists'
	, adamchesterUrl = 'https://gist.github.com/adamchester'
	, viewModelCache = undefined;

/*
 * GET /about page.
 */
exports.about = function(req, res) {
	res.render('abouts/index', { title: 'About' })
};

/*
 * GET home page.
 */
exports.index = function(req, res){

  getIndexModel(gistListUrl, gistsToViewModel, function() {
  	res.render('index', viewModelCache);
  });
};


var getIndexModel = function(url, transform, callback) {

	var age = (new Date() - lastGet) / 60000;
	console.log('gist cache age %d', age);

	// TODO: need a better way to refresh cache asynchronously ?

	if (age > 5) {
		console.log('(re)loading gists from %s', url);

		request({ url: url, json: true }, function (error, response, body) {

			console.log('got response from %s', url);

			if (!error && response.statusCode == 200) {
				viewModelCache = transform(body);
				lastGet = new Date();
				console.log("updated viewModelCache at %s", lastGet.toLocaleString());
			} else {
				console.log("failed to get gists from %s. Using existing viewModelCache.", url);
			}

			// ensure we always have a view model after app restart
			if (viewModelCache === undefined) {
				viewModelCache = makeEmptyGistsModel();
			}

			callback();
		});
	}
	else
	{
		// cached viewmodel has *not* expired
		callback();
	}
};

var toViewModel = function(gist) {
	return { 
		markdown: 'todo', // TODO: get markdown contents from github and put here?
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

var gistsToViewModel = function(gists) {
	return { 
		gists: _.chain(gists).filter(isBlogGist).map(toViewModel).sortBy(date).value().reverse()
	};
};

var makeEmptyGistsModel = function() { 
	return [
		{ url: adamchesterUrl, created_at: new Date(), comments: 0, description: 'Gists are being loaded, refresh the page' },
	];
};

var isBlogGist = function(gist) {
	var fileName = gist.files[_(gist.files).keys()[0]].filename;
	return /blog_.+\.md/.test(fileName);
} 

/*
[
  {
    "git_pull_url": "git://gist.github.com/2861047.git",
    "user": {
      "login": "adamchester",
      "avatar_url": "https://secure.gravatar.com/avatar/acf539a9cfc9f646dd85e81a948cb736?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png",
      "gravatar_id": "acf539a9cfc9f646dd85e81a948cb736",
      "url": "https://api.github.com/users/adamchester",
      "id": 570470
    },
    "files": {
      "blog_welcome.md": {
        "type": "text/plain",
        "language": "Markdown",
        "size": 151,
        "filename": "blog_welcome.md",
        "raw_url": "https://gist.github.com/raw/2861047/0b496814b8511c84cef7a174fa0b06c98e34fdd2/blog_welcome.md"
      }
    },
    "git_push_url": "git@gist.github.com:2861047.git",
    "description": "Welcome to my blog, it may be updated rarely",
    "public": true,
    "created_at": "2012-06-03T02:37:32Z",
    "url": "https://api.github.com/gists/2861047",
    "comments": 1,
    "updated_at": "2012-06-17T10:26:29Z",
    "html_url": "https://gist.github.com/2861047",
    "id": "2861047"
  }
]
*/

var requestJsonWithCallback = function(url, callback) {

	request({ url: url, json: true }, function (error, response, body) {

		console.log('got response from %s', url);

		if (!error && response.statusCode == 200) {
			// success
		} else {
			console.log("failed to get data from %s.", url);
		}

		callback(error, response, body);
	});
}
