import Handlebars from 'handlebars';
var movieNames = new Bloodhound ({
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	datumTokenizer: function(d) {
		return Bloodhound.tokenizers.whitespace(d.name);
	},
	remote: {
		url: "/search?q=%NAME",
		wildcard: "%NAME"
	}
});

$('.type-movies').typeahead(null, {
	name: "movie-names",
	display: "name",
	limit: 10,
	source: movieNames,
	templates: {
		suggestion: Handlebars.compile('<div><strong>{{name}}</strong> ({{year}}) ({{type}})</div>')
	}
});
