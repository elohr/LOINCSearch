var React = require('react'),
    SearchActions = require('../actions/SearchActions'),
    SearchStore = require('../stores/SearchStore');

var Results = React.createClass({
    _clearSearch: function () {
        SearchActions.clear();
    },

    /*
     * React Events
     */
    getInitialState: function () {
        return SearchStore.getState();
    },

    componentDidMount: function () {
        SearchStore.addListener(SearchStore.RESULT_EVENT, this._onChange);
    },

    componentWillUnmount: function () {
        SearchStore.removeListener(SearchStore.RESULT_EVENT, this._onChange);
    },

    /*
     * Custom Events
     */
    _onChange: function () {
        this.replaceState(SearchStore.getState());
    },

    /*
     * Render
     */
    render: function () {
        var contents, isShown = '';

        if (this.state.results && this.state.results.length > 0) {
            var t = this;

            isShown = 'show';
            contents = this.state.results.map(function (item, i) {
                var statusClass = 'active',
                    method, property, system, time, units, match;

                if(item._source.status !== 'ACTIVE') {
                    statusClass = 'other';
                }

                if(item._source.fullMethodType) {
                    method = <span className="method">Method: {item._source.fullMethodType}</span>;
                }

                if(item._source.fullProperty) {
                    property = <span className="property">Property: {item._source.fullProperty}</span>
                }

                if(item._source.fullSystem) {
                    system = <span className="system">System: {item._source.fullSystem}</span>;
                }

                if(item._source.fullTimeAspect) {
                    time = <span className="time-aspect">Time: {item._source.fullTimeAspect}</span>;
                }

                if(item._source.units) {
                    units = <span className="units">Units: {item._source.units}</span>;
                }

                var parts = item._source.relatedNames.toLowerCase().split(';');
                for (var i = 0; i < parts.length; i++) {
                    if (parts[i].indexOf(t.state.searchString) >= 0) {
                        match = <span className="alt-name">Rel. Name: {parts[i]}</span>;
                        break;
                    }
                }

                if (match == null) {
                    for (var i = 0; i < item._source.alts.length; i++) {
                        if (item._source.alts[i].name.toLowerCase().indexOf(t.state.searchString) >= 0) {
                            match = <span className="alt-name">Alt. Name: {item._source.alts[i].name}</span>;
                            break;
                        }
                    }
                }

                return (
                    <li key={item._id} onClick={t._clearSearch} className={statusClass}>
                        <span className="loinc-num">{item._source.loincNum}</span>
                        <span className="name">{item._source.longCommonName}</span>
                        {match}
                        <div className="left">
                            {property}
                            {system}
                        </div>
                        <div className="right">
                            <span className="util">Util.: {item._source.utilization}</span>
                            {method}
                            {time}
                            {units}
                        </div>
                        <div className="clear"></div>
                    </li>
                );
            });
        } else if(this.state.emptySearch) {
            contents = <li className="no-results">...</li>;
        } else {
            isShown = 'show';
            contents = <li className="no-results">No results were found :(</li>;
        }

        return (
            <ul id="search-results" className={isShown}>
                {contents}
            </ul>
        );
    }
});

module.exports = Results;