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
	mdb.searchMulti({query: movie_name}, function(err, res) {
		//assuming that the top result of API is what we want.
		if( res['results'][0]['media_type'] == 'movie' ) {
			movie = res['results'][0];
			mdb.movieCredits({id: movie['id']}, function(err, res) {
				var ret = { 'type': 'movie', 'credits': res};
				callback(ret);
			});
		}
		else { //TV
			tv = res['results'][0];
			mdb.tvCredits({id: tv['id']}, function(err, res) {
				var ret = { 'type': 'tv', 'credits':res};
				callback(ret);
			});
		}
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
	var ret_hash = {};

	var ret = {};
	ret['movie_a'] = credits_a['credits']['id'];
	ret['movie_b'] = credits_b['credits']['id'];
	ret['credits'] = [];

	
	var castcrew = { 'cast_a': credits_a['credits']['cast'], 'crew_a' : credits_a['credits']['crew'],
					 'cast_b': credits_b['credits']['cast'], 'crew_b' : credits_b['credits']['crew'] };
	try{

	for( credits_type in castcrew ) {
		for( idx in castcrew[credits_type] ) {
			var credits_column, credits_label, credits_id;
			
			if( credits_type.includes('_a') )
				credits_column = "credits_a";
			else
				credits_column = "credits_b";

			if( credits_type.includes('cast'))
				credits_label = "character";
			else
				credits_label = "job";

			credits_id = castcrew[credits_type][idx]['id'];

			if( hash.hasOwnProperty( credits_id ) ){	
				//include department if necessary in the future
				if( hash[credits_id].hasOwnProperty( credits_column ) ) {
					hash[credits_id][credits_column]['role'].push(castcrew[credits_type][idx][credits_label]);
				}
				else
					hash[credits_id][credits_column] = { "role" : [castcrew[credits_type][idx][credits_label]] }; 

				if( hash[credits_id].hasOwnProperty('credits_a') && hash[credits_id].hasOwnProperty('credits_b') )
					ret_hash[credits_id] = hash[credits_id];
			}
			else {
				hash[credits_id] = 
				{
					"id": credits_id,
					"name": castcrew[credits_type][idx]['name']
				}
				hash[credits_id][credits_column] = { 'role' : [castcrew[credits_type][idx][credits_label]] };
			}
		}
	}
	}
	catch(e) {
		console.log(e.stack);
	}

	for(key in ret_hash) 
		ret['credits'].push(ret_hash[key]);
	callback( ret );
}

function getNames( query_string, callback )
{
	names = [];
	mdb.searchMulti({ query: query_string}, function(err, res) {
		if(res) {
			names = res['results'].slice(0,5);
			callback(names);
		}
	});
}

function formatForTypeahead( items, callback ) {

	formatted_items = [];
	items.forEach( function(item) {
	var year = "-";
	try{
		if( ('first_air_date' in item) && (item['first_air_date'] != null) ) 
			year = item['first_air_date'].substring(0,4);
		else if ( ('release_date' in item) && (item['release_date'] != null))	
			year = item['release_date'].substring(0,4);
	}
	catch(e) {
		console.log( "Exception for Item: " + item["name"] );
		console.log(e.stack);
	}
	formatted_item =  {	"id": item['id'],
						"name": item['name']? item['name']: item['title'],
   						"type": item['media_type'],
						"year": year
	}
	formatted_items.push(formatted_item);
	//media_type can be many others too.

	});
	callback(formatted_items);
}

app.get('/:movie_a/feelslike/:movie_b', function(req, res) {

	getFeels(req.params.movie_a, req.params.movie_b, function(feels){
		res.send(feels);
	});
});

app.get('/search', function(req, res) {
	getNames(req.query.q, function(names) {
		formatForTypeahead( names, function( formatted_names) {
			res.send(formatted_names);
		});
	});
});

app.use(express.static('public'));
