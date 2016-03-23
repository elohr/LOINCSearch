var React = require('react'),
    Results = require('./Results'),
    SearchActions = require('../actions/SearchActions'),
    SearchStore = require('../stores/SearchStore');

var DEFAULT_TEXT = 'LOINC Search...';

var SearchInput = React.createClass({
    getInitialState: function() {
        return {
            text: DEFAULT_TEXT
        };
    },

    componentDidMount: function () {
        SearchStore.addListener(SearchStore.SEARCH_CLEARED_EVENT, this._handleSearchCleared);
    },

    componentWillUnmount: function () {
        SearchStore.removeListener(SearchStore.SEARCH_CLEARED_EVENT, this._handleSearchCleared);
    },

    /*
     * Custom Events
     */
    _handleFocus: function(event) {
        var target = event.target;

        if(target.value === DEFAULT_TEXT) {
            target.value = '';
        }

        if(target.className.indexOf(' active') < 0) {
            target.className += ' active';
        }
    },

    _handleBlur: function(event) {
        event.target.className = event.target.className.replace(' active', '');

        if(event.target.value.trim() === '') {
            event.target.value = DEFAULT_TEXT;
        }
    },

    _handleTextSearchChange: function () {
        var target = document.getElementById('search-input'),
            text = target.value;

        SearchActions.search(text);

        this.setState({
            text: text
        });
    },

    _handleSearchCleared: function() {
        document.getElementById('search-input').value = DEFAULT_TEXT;
    },

    /*
     * Render
     */
    render: function () {
        return (
            <input id="search-input" type="text" value={this.state.text} onFocus={this._handleFocus} onBlur={this._handleBlur} onChange={this._handleTextSearchChange}/>
        );
    }
});

module.exports = SearchInput;