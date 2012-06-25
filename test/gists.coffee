
assert = require 'assert'
gists = require('../lib/gists.js')

#http = require('http')
# do nothing in our mock request handler
#handleRequest = (req, res) -> return
#createServer = http.createServer handleRequest
	

describe 'gists', ->

	describe 'exports', ->
		it 'should export', -> assert gists isnt undefined
		it 'should export getGists()', -> assert gists.getGists isnt undefined
		it 'should not export toViewModel', -> assert gists.toViewModel is undefined

	describe 'Gists.getGists', ->

		it 'should return a viewModel and make the callback', (done) ->

			gists.getGists 'adamchester', (viewModel) ->
				# console.log viewModel
				assert viewModel isnt undefined
				done()

		it 'should do something!', -> true



