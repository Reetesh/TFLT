var config = require("./config");

var express = require("express");
var app = express();

var mdb = require('moviedb')(config.apiKey);

var server = app.listen(3000, config.appHost,  function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening to http://%s:%s', host, port);
});

function getCredits(movie_name, callback) {
	mdb.searchMovie({query: movie_name}, function(err, res) {
		//assuming that the top result of API is what we want.
		movie = res['results'][0];
		mdb.movieCredits({id: movie['id']}, function(err, res) {
			callback(res);
		});
	});
}

function getFeels( movie_a, movie_b, callback) {
	
	var credits_a, credits_b;

	getCredits(movie_a, function( res ) {
		credits_a = res;
		getCredits(movie_b, function(res) {
			credits_b = res;
			getCommonCredits(credits_a, credits_b, function(res){
				callback(res);
			});
		});
	});

}

function getCommonCredits( credits_a, credits_b, callback){

	var ret = [];
	var hash = new Object();
	for( idx in  credits_a['cast'] ) {
		hash[credits_a['cast'][idx]['name']] = 1;
	}
	for( idx in credits_a['crew'] ) {
		hash[credits_a['crew'][idx]['name']] = 1;
	}

	//now find matching in credits_b
	for( idx in credits_b['cast'] ) {
		if( hash.hasOwnProperty( credits_b['cast'][idx]['name'] )) {
			hash[credits_b['cast'][idx]['name']]++;
		}
	}
	for( idx in credits_b['crew']) {
		if(hash.hasOwnProperty( credits_b['crew'][idx]['name']) ){
			hash[credits_b['crew'][idx]['name']]++;
		}
	}
	for( var key in hash) {
		if( hash[key] < 2 ) {
			delete hash[key];
		}
	}

	callback( hash );
}

app.get('/', function (req, res) {
	res.send('Go To URL: /movie_a/feelslike/movie_b');
});

app.get('/:movie_a/feelslike/:movie_b', function(req, res) {

	getFeels(req.params.movie_a, req.params.movie_b, function(feels){
		res.send(feels);
	});
});
