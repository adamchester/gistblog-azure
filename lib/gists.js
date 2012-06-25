
var request = require("request")
	, _ = require("underscore");

var Gists = (function() {

	var lastGet = new Date(2000,1,1)
		, adamchesterUrl = 'https://gist.github.com/adamchester'
		, apiRootUrl = 'https://api.github.com/users/'
		, viewModelCache = undefined;

	function constructor() {
	};

	function getApiUrlForUserName(username) {
		return apiRootUrl + username + '/gists';
	};

	function toViewModel(gist) {
		return { 
			markdown: 'todo', // TODO: get markdown contents from github and put here?
			raw_url: getFirstGistFile(gist).raw_url,
		  	id: gist.id,
		  	description: gist.description, 
		  	created_at: new Date(gist.created_at), 
		  	url: 'https://gist.github.com/' + gist.id,
		  	comments: gist.comments
		};
	};

	function date(gist) {
		return gist.created_at;
	};

	function gistsToViewModel(gists) {
		return { 
			gists: _.chain(gists)
				.filter(isBlogGist)
				.map(toViewModel)
				.sortBy(date)
				.value().reverse()
		};
	};

	function makeEmptyGistsModel() { 
		return [
			{ url: adamchesterUrl, created_at: new Date(), comments: 0, description: 'Gists are being loaded, refresh the page' },
		];
	};

	function getFirstGistFile(gist) {
		return gist.files[_(gist.files).keys()[0]];
	};

	function isBlogGist(gist) {
		var firstGistFile = getFirstGistFile(gist);
		var fileName = firstGistFile.filename;
		return /blog_.+\.md/.test(fileName);
	};


	function retrieveRawGistContent(gist) {

		var rawUrl = gist.raw_url
			, theGist = gist;

		console.log('getting raw for %s', gist.raw_url);

		request({ url: rawUrl, json: true }, function (error, response, body) {
				
				if (!error && response.statusCode == 200) {
					theGist.markdown = body;
					console.log("updated gist.markdown from url %s", rawUrl);
				} else {
					console.log("failed to get gists from %s. Using existing viewModelCache.", rawUrl);
				}
			});

		console.log('returning gist %s', gist);
		return gist;
	};

	function getGists(username, callback) {

		var age = (new Date() - lastGet) / 60000;
		var url = getApiUrlForUserName(username);

		// console.log('gist cache age %d', age);
		// TODO: need a better way to refresh cache asynchronously ?

		if (age > 5) {

			console.log('(re)loading gists from %s', url);
			request({ url: url, json: true }, function (error, response, body) {
				
				// console.log('got response from %s', url);
				if (!error && response.statusCode == 200) {
					viewModelCache = gistsToViewModel(body);
					lastGet = new Date();
					// console.log("updated viewModelCache at %s", lastGet.toLocaleString());
				} else {
					console.log("failed to get gists from %s. Using existing viewModelCache.", url);
				}

				// ensure we always have a view model after app restart
				if (viewModelCache === undefined) {
					viewModelCache = makeEmptyGistsModel();
				}

				// get the raw markdown for each cached gist
				callback(viewModelCache);
			});
		}
		else
		{
			// cached viewmodel has *not* expired
			callback(viewModelCache);
		}
	};


	constructor.prototype = {
		getGists: getGists
	};

	return constructor;
})();


module.exports = new Gists();

