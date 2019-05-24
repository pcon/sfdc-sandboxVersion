global.window = window;
global.jQuery = require('jquery');
global.Q = require('q');
global.axios = require('axios');

/**
 * Gets the span for the table entry
 * @param {String} id The Id of the span
 * @param {Object} content The content of the span
 * @returns {String} The HTML
 */
function getSandboxSpan(id, content) {
    return `<span id="${id}">${content}</span>`;
}

/**
 * Gets the span for the table entry
 * @param {String} id The Id of the span
 * @param {Object} content The content of the span
 * @returns {String} The HTML
 */
function getSandboxRow(id, content) {
    return '<tr><td>' + getSandboxSpan(id, content) + '</td></tr>';
}

var sandbox_table_spring = getSandboxRow('first_location', 'CS1');
var sandbox_table_summer = getSandboxRow('second_location', 'CS22');
var sandbox_table_winter = getSandboxRow('third_location', 'CS333');
var sandbox_table_unknown = getSandboxRow('fourth_location', 'CS4444');

var sandbox_table_html_inner =
    '<tbody>' +
        sandbox_table_spring +
        sandbox_table_summer +
        sandbox_table_winter +
        sandbox_table_unknown +
    '</tbody>';

var sandbox_table_html =
    '<table id="listSandbox_extrastuff">' + sandbox_table_html_inner + '</table>';

var mockData = {
    'CS1': {
        releaseVersion: 'Winter 19',
        key: 'CS1'
    },
    'CS22': {
        releaseVersion: 'Summer 19',
        key: 'CS22'
    },
    'CS333': {
        releaseVersion: 'Spring 19',
        key: 'CS333'
    }
};

beforeEach(function () {
    jest.restoreAllMocks();
    document.body.innerHTML = sandbox_table_html;
    require('axios').__setMockResults(mockData); // eslint-disable-line global-require
});

test('get URL', function () {
    var content = require('../src/content'); // eslint-disable-line global-require

    expect(content.getURL('CS1')).toEqual('https://api.status.salesforce.com/v1/instances/CS1/status/preview');
});

describe('Icon symbols', function () {
    test('Spring', function () {
        var content = require('../src/content'); // eslint-disable-line global-require

        expect(content.getIconSymbol('Spring \'20')).toEqual('\u273f');
    });

    test('Summer', function () {
        var content = require('../src/content'); // eslint-disable-line global-require

        expect(content.getIconSymbol('Summer \'20')).toEqual('\u2600');
    });

    test('Winter', function () {
        var content = require('../src/content'); // eslint-disable-line global-require

        expect(content.getIconSymbol('Winter \'20')).toEqual('\u2744');
    });

    test('Unknown', function () {
        var content = require('../src/content'); // eslint-disable-line global-require

        expect(content.getIconSymbol('Fall \'20')).toEqual('\u2754');
    });

    test('Undefined', function () {
        var content = require('../src/content'); // eslint-disable-line global-require

        expect(content.getIconSymbol(undefined)).toEqual('\u2754');
    });
});

test('Location HTML', function () {
    var content = require('../src/content'); // eslint-disable-line global-require
    var data = {
        releaseVersion: 'Winter 19',
        key: 'CS1'
    };

    expect(content.getLocationHTML(data)).toEqual('<span title="Winter 19">\u2744</span> CS1');
});

test('Find hosts', function () {
    var content = require('../src/content'); // eslint-disable-line global-require

    var expectedResults = [ 'CS1', 'CS22', 'CS333', 'CS4444' ];

    expect.assertions(1);

    return content.findHosts().then(function (hostnames) {
        expect(hostnames).toEqual(expectedResults);
    });
});

test('Enrich page', function () {
    var content = require('../src/content'); // eslint-disable-line global-require
    var instance_map = {
        'CS1': {
            releaseVersion: 'Winter 19',
            key: 'CS1'
        },
        'CS22': {
            releaseVersion: 'Summer 19',
            key: 'CS22'
        },
        'CS333': {
            releaseVersion: 'Spring 19',
            key: 'CS333'
        }
    };

    var expectedResults =
        '<table id="listSandbox_extrastuff">' +
            '<tbody>' +
                getSandboxRow('first_location', '<span title="Winter 19">\u2744</span> CS1') +
                getSandboxRow('second_location', '<span title="Summer 19">\u2600</span> CS22') +
                getSandboxRow('third_location', '<span title="Spring 19">\u273f</span> CS333') +
                getSandboxRow('fourth_location', '<span title="Unknown">\u2754</span> CS4444') +
            '</tbody>' +
        '</table>';

    expect.assertions(1);

    return content.enrichPage(instance_map).then(function () {
        expect(document.body.innerHTML).toEqual(expectedResults);
    });
});

describe('Get host data', function () {
    test('Valid host', function () {
        var content = require('../src/content'); // eslint-disable-line global-require
        var expectedResults = { data: {
            releaseVersion: 'Winter 19',
            key: 'CS1'
        }};

        expect.assertions(1);

        return content.getHostdata('CS1').then(function (data) {
            expect(data).toEqual(expectedResults);
        });
    });

    test('Invalid host', function () {
        var content = require('../src/content'); // eslint-disable-line global-require

        expect.assertions(1);

        return content.getHostdata('CS55555').catch(function (error) {
            expect(error).toEqual('I AM ERROR');
        });
    });
});

test('Get all hostdata', function () {
    var content = require('../src/content'); // eslint-disable-line global-require
    var expectedResults = {
        'CS1': {
            releaseVersion: 'Winter 19',
            key: 'CS1'
        },
        'CS333': {
            releaseVersion: 'Spring 19',
            key: 'CS333'
        }
    };

    expect.assertions(1);

    return content.getAllHostdata([ 'CS1', 'CS333', 'CS55555' ]).then(function (data) {
        expect(data).toEqual(expectedResults);
    });
});

test('Run extension', function () {
    var content = require('../src/content'); // eslint-disable-line global-require

    var expectedResults =
        '<table id="listSandbox_extrastuff">' +
            '<tbody>' +
                getSandboxRow('first_location', '<span title="Winter 19">\u2744</span> CS1') +
                getSandboxRow('second_location', '<span title="Summer 19">\u2600</span> CS22') +
                getSandboxRow('third_location', '<span title="Spring 19">\u273f</span> CS333') +
                getSandboxRow('fourth_location', '<span title="Unknown">\u2754</span> CS4444') +
            '</tbody>' +
        '</table>';

    expect.assertions(1);

    return content.runExtension().then(function () {
        expect(document.body.innerHTML).toEqual(expectedResults);
    });
});