import React from 'react';
import ReactDOM from 'react-dom';

var config = require('../../config');

var MainBox = React.createClass({
	handleFeelsSubmit: function(movies) {
		$.ajax({
			url: config.route+movies['a']+"/feelslike/"+movies['b'],
			type: 'GET',
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err){
				console.error( xhr, status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function() {
		return {data: {"credits": []} };
	},
	render: function() {
		return (
			<div className="mainBox">
				<QuestionBox onFeelsSubmit={this.handleFeelsSubmit} />
				<h3>{"Because"}</h3>
				<ResultBox data={this.state.data} />
				<h4>{"were involved with both movies."}</h4>
			</div>
		);
	}
});

var QuestionBox = React.createClass({
	submitFeels: function(e) {
		e.preventDefault();
		var movie_a = this.refs.movie_a.value;
		var movie_b = this.refs.movie_b.value;
		if ( !movie_a || !movie_b ) {
			return;
		}
		this.props.onFeelsSubmit({a: movie_a, b: movie_b});
		return;
	},

	render: function() {
		return(
			<div className="questionBox">
			Why Does <input className="type-movies" ref="movie_a" />  {" Feel Like "} <input className="type-movies" ref="movie_b" />
			<input type="submit" value="?"  onClick={this.submitFeels} />
			</div>
			);
	}
});			

var ResultBox = React.createClass({
	render: function() {
		var resultRows = this.props.data['credits'].map(function (person, index) {
			return (
				<div className="credit" key={index}>
					<h2>{person["name"]}</h2>
					<div>{person["credits_a"]["role"]} {","} {person["credits_b"]["role"]}</div>
				</div>
				);
		});
		return (
			<div className="resultBox">
				{resultRows}
			</div>
		);
	}
});

/* Find a Way to use NameBox in QuestionBox and get values from Child to Parent
var NameBox = React.createClass({
	render: function() {
		return(
			<div className="nameBox">
				<input ref={this.props.ref}/>
			</div>
		);
	}
});
*/
			
ReactDOM.render(
	<MainBox />,
	document.getElementById('tflt')
);
