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

	var hash = new Object();

	var ret = {};
	ret['movie_a'] = credits_a['id'];
	ret['movie_b'] = credits_b['id'];
	ret['credits'] = [];

	for( idx in credits_a['cast'] ) {	
		hash[credits_a['cast'][idx]['id']] = 
			{	"id": credits_a['cast'][idx]['id'],
				"name": credits_a['cast'][idx]['name'],
				"credits_a": {
					"role": credits_a['cast'][idx]['character'],
					"department": "Cast" 
				}
			};
	}
	for( idx in credits_a['crew'] ) {
		hash[credits_a['crew'][idx]['id']] = 
			{	"id": credits_a['crew'][idx]['id'],
				"name": credits_a['crew'][idx]['name'],
				"credits_a": {
				   "role": credits_a['crew'][idx]['job'],
				   "department": credits_a['crew'][idx]['department']
				}
			};
	}

	//now find matching in credits_b
	for( idx in credits_b['cast'] ) {
		if( hash.hasOwnProperty( credits_b['cast'][idx]['id'] )) {
			hash[credits_b['cast'][idx]['id']]["credits_b"] = 
			   	{	"role": credits_b['cast'][idx]['character'],
					"department": "Cast"
			   	};
			ret['credits'].push(hash[credits_b['cast'][idx]['id']]);
		}
	}
	for( idx in credits_b['crew']) {
		if( hash.hasOwnProperty( credits_b['crew'][idx]['id'] )) {
			hash[credits_b['crew'][idx]['id']]["credits_b"] =
			   	{	"role": credits_b['crew'][idx]['job'],
					"department": credits_b['crew'][idx]['department']
				};
			ret['credits'].push(hash[credits_b['crew'][idx]['id']]);
		}
	}

	callback( ret );
}


app.get('/:movie_a/feelslike/:movie_b', function(req, res) {

	getFeels(req.params.movie_a, req.params.movie_b, function(feels){
		res.send(feels);
	});
});
app.use(express.static('public'));
