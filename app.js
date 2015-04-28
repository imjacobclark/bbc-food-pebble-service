var http 	= require('http');
	cheerio = require('cheerio'),
	q		= require('q');

function makeRequest(url){
	var deferred = q.defer();

	http.get(url, function(res) {
		var str = "";

		res.on('data', function (chunk) {
			str += chunk;
		});

		res.on('end', function () {
			 deferred.resolve(str);
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});

	return deferred.promise;
};

function parseData(){
	var deferred = q.defer();

	makeRequest('http://www.bbc.co.uk/food/recipes/search?inSeason=true').then(function(data){
		var $ 		= cheerio.load(data),
			json	= [];

		var d = $('#article-list ul li h3 a').each(function(i, link){
			json.push({
				title	: $(link).text(),
				url		: $(link)[0].attribs.href
			});
		});

		deferred.resolve(json);
	});

	return deferred.promise;
};

parseData().then(function(data){
	console.log(data[Math.floor((Math.random() * 10) + 1)]);
});
