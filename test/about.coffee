
assert = require 'assert'
routes = require '../routes/about.js'

describe 'about', ->

	describe 'module', ->
		it 'should export About', -> assert routes.About isnt undefined
		it 'should export About.index', -> assert routes.About.index isnt undefined

	describe 'index', ->
		it 'should call res.render with abouts/index and model.title', ->
			req = { }
			res = 
				render: (name, model) ->
					assert name is 'abouts/index'
					assert model isnt undefined
					assert model.title is 'About'

			routes.About.index(req, res)

