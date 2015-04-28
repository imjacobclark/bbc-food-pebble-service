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
        var $       = cheerio.load(data);

        var d = $('#queryBox').text();

        d = d.replace(' results found', '');

        return Math.round(d/15);

    }).then(function(pages){
        makeRequest('http://www.bbc.co.uk/food/recipes/search?page=' + Math.floor((Math.random() * pages) + 1) + '&inSeason=true&sortBy=lastModified').then(function(data){

            var $       = cheerio.load(data),
                json    = [];

            var d = $('#article-list ul li h3 a').each(function(i, link){
                json.push({
                    title   : $(link).text(),
                    url     : 'http://bbc.co.uk' + $(link)[0].attribs.href
                });
            });

            deferred.resolve(json);
        });
    });

    return deferred.promise;
};

var server = http.createServer().listen(9111, '0.0.0.0');

server.on('request', function(req, res) {
    parseData().then(function(data){
        var _this = this;

        res.setHeader('Content-Type', 'application/json');

        if(req.url ==='/'){
            res.end( JSON.stringify( data[Math.floor((Math.random() * 14) + 1)] ));
        }
    });
});

