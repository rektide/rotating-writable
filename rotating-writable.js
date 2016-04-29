"use strict"

var fs = require("fs"),
	hourly = require("hourly"),
	path = require("path"),
	promisify = require("es6-promisify")

function buildSuffix(date){
	date = date || new Date()
	return ["", "." + date.getFullYear(), "-",
		date.getMonth() + 1, "-",
		date.getDate(), "-",
		date.getHours()]
}

function RotatingWritable(basePath, options) {
	// default to cwd if no path provided
	if(!(basePath instanceof String) && basePath instanceof Object){
		options = basePath
		basePath = null
	}
	basePath = basePath || process.cwd()
	options = options || {}
	if(!options.flags){
		options.flags = "a"
	}
	// auto generate a file name if basePath is a directory
	var baseStat = fs.statSync(basePath)
	if(baseStat.isDirectory()){
		basePath = basePath + path.sep + "application.log"
	}

	// MAIN STATE
	var writable

	// generate a new writable
	function buildWritable(date){
		// clean-up old writable
		if(writable){
			var previousWritable = writable
			process.nextTick(function(){
				previousWritable.end()
			})
		}

		// calculate filename
		date = date || new Date()
		var filename$ = buildSuffix(date)
		filename$[0] = basePath
		var filename = filename$.join("")
		writable = (options && options.writableFactory || fs.createWriteStream)(filename, options)
	}

	// run now
	buildWritable()
	// run on the hour
	var cancel = hourly(buildWritable())

	// factory method for the current writable stream
	function writableStream(){
		return writable
	}
	// provide a hook to end (which will also close the stream via end)
	writableStream.end = function(){
		cancel()
		writable.end.apply(writable, arguments)
	}
	return writableStream
}

module.exports = RotatingWritable
module.exports.RotatingWritable = RotatingWritable
