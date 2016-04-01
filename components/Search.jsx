var React = require('react'),
    SearchInput = require('./SearchInput'),
    Results = require('./Results');

var Search = React.createClass({
    render: function () {
        return (
            <div>
                <Results />

                <div id="search-form">
                    <SearchInput />
                </div>
            </div>
        );
    }
});

module.exports = Search;