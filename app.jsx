var React = require('react'),
    ReactDOM = require('react-dom'),

    Search = require('./components/Search');

var App = React.createClass({
    render: function () {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
});

ReactDOM.render(
    <Search />,
    document.getElementById('app-container')
);