var React = require('react'),
    SearchInput = require('./SearchInput'),
    Results = require('./Results');

var Search = React.createClass({
    render: function () {
        return (
            <div>
                <Results />

                <div id="search-form">
                    <img src="i/logo.png" alt="logo" width="20px" />
                    <SearchInput />
                </div>
            </div>
        );
    }
});

module.exports = Search;