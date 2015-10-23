"use strict";

var MainBox = React.createClass({
	displayName: "MainBox",

	handleFeelsSubmit: function handleFeelsSubmit(movies) {
		$.ajax({
			url: "/" + movies['a'] + "/feelslike/" + movies['b'],
			type: 'GET',
			success: (function (data) {
				this.setState({ data: data });
			}).bind(this),
			error: (function (xhr, status, err) {
				console.error(xhr, status, err.toString());
			}).bind(this)
		});
	},
	getInitialState: function getInitialState() {
		return { data: [] };
	},
	render: function render() {
		return React.createElement(
			"div",
			{ className: "mainBox" },
			React.createElement(QuestionBox, { onFeelsSubmit: this.handleFeelsSubmit }),
			React.createElement(
				"h3",
				null,
				"Because"
			),
			React.createElement(ResultBox, { data: this.state.data }),
			React.createElement(
				"h4",
				null,
				"were involved with both movies."
			)
		);
	}
});

var QuestionBox = React.createClass({
	displayName: "QuestionBox",

	submitFeels: function submitFeels(e) {
		e.preventDefault();
		var movie_a = this.refs.movie_a.value;
		var movie_b = this.refs.movie_b.value;
		if (!movie_a || !movie_b) {
			return;
		}
		this.props.onFeelsSubmit({ a: movie_a, b: movie_b });
		return;
	},
	render: function render() {
		return React.createElement(
			"div",
			{ className: "questionBox" },
			React.createElement(
				"div",
				null,
				React.createElement("input", { type: "text", ref: "movie_a" }),
				" ",
				" Feels Like ",
				" ",
				React.createElement("input", { type: "text", ref: "movie_b" }),
				" "
			),
			React.createElement("input", { type: "submit", value: "Why?", onClick: this.submitFeels })
		);
	}
});

var ResultBox = React.createClass({
	displayName: "ResultBox",

	render: function render() {
		var resultRows = this.props.data.map(function (person, index) {
			return React.createElement(
				"div",
				null,
				person.name
			);
		});
		return React.createElement(
			"div",
			{ className: "resultBox" },
			resultRows
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

ReactDOM.render(React.createElement(MainBox, null), document.getElementById('tflt'));