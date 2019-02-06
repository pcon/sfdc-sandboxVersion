const SELECTOR_TABLE = 'listSandbox';
const SELECTOR_LOCATION = 'location';

const RELEASE_SPRING = 'spring';
const RELEASE_SUMMER = 'summer';
const RELEASE_WINTER = 'winter';

const ICON_SPRING = '\u273f';
const ICON_SUMMER = '\u2600';
const ICON_WINTER = '\u2744';
const ICON_UNKNOWN = '\u2754';

var ICON_MAP = {};
ICON_MAP[RELEASE_SPRING] = ICON_SPRING;
ICON_MAP[RELEASE_SUMMER] = ICON_SUMMER;
ICON_MAP[RELEASE_WINTER] = ICON_WINTER;

/**
 * Gets the sandbox table
 * @returns {Object} The table containing the sandbox information
 */
var getSandboxTable = function () {
    return jQuery(`table[id^=${SELECTOR_TABLE}]`);
};

/**
 * Acts on each of the locations
 * @param {function} callback The method to call with each of the spans
 * @returns {undefined}
 */
var actOnLocations = function (callback) {
    getSandboxTable().find(`span[id$=${SELECTOR_LOCATION}]`).each(callback);
};

/**
 * Finds all the hosts
 * @param {Number} index Unused
 * @param {Object} data The span to use when testing
 * @returns {Promise} A promise for an array of all the instance names
 */
var findHosts = function () {
    var deferred = Q.defer();

    var instances = new Set();
    actOnLocations(function () {
        instances.add(jQuery(this).text());
    });

    deferred.resolve(Array.from(instances));

    return deferred.promise;
};

/**
 * Gets the URL for the status API
 * @param {string} instance_name The instance name
 * @returns {string} The status API URL
 */
var getURL = function (instance_name) {
    return `https://api.status.salesforce.com/v1/instances/${instance_name}/status/preview`;
};

/**
 * Gets the status data about a instance
 * @param {string} instance_name The instance name
 * @returns {Promise} A promise for the instance status data
 */
var getHostdata = function (instance_name) {
    var deferred = Q.defer();

    axios.get(getURL(instance_name))
        .then(function (response) {
            deferred.resolve(response);
        }).catch(function (error) {
            deferred.reject(error);
        });

    return deferred.promise;
};

/**
 * Get all the host data
 * @param {Array<String>} instance_names An array of instance names
 * @returns {Promise} A promise for a map of instance names to status data
 */
var getAllHostdata = function (instance_names) {
    var deferred = Q.defer();
    var promises = [];
    var instance_map = {};

    instance_names.forEach(function (instance_name) {
        promises.push(getHostdata(instance_name));
    });

    Q.allSettled(promises)
        .then(function (results) {
            results.forEach(function (result) {
                if (result.state === 'fulfilled') {
                    instance_map[result.value.data.key] = result.value.data;
                }
            });

            deferred.resolve(instance_map);
        });

    return deferred.promise;
};

/**
 * Gets the icon symbol
 * @param {String} releaseVersion The release version
 * @returns {String} The icon
 */
var getIconSymbol = function (releaseVersion) {
    var releaseName = typeof releaseVersion === 'undefined' ? '' : releaseVersion.toLowerCase().split(' ')[0];

    return releaseName in ICON_MAP ? ICON_MAP[releaseName] : ICON_UNKNOWN;
};

/**
 * Gets the HTML for the location column
 * @param {Object} instance_data The instance data
 * @returns {string} The HTML to display
 */
var getLocationHTML = function (instance_data) {
    return `<span title="${instance_data.releaseVersion}">${getIconSymbol(instance_data.releaseVersion)}</span> ${instance_data.key}`;
};

/**
 * Enrich the page with the host data
 * @param {Object} instance_map A map of instance name to instance data
 * @return {Promise} A promise for when the page is enriched
 */
var enrichPage = function (instance_map) {
    var deferred = Q.defer();

    actOnLocations(function () {
        var instance = jQuery(this).text();

        var unknown_instance = {
            releaseVersion: 'Unknown',
            key: instance
        };

        var instance_data = instance in instance_map ? instance_map[instance] : unknown_instance;
        jQuery(this).html(getLocationHTML(instance_data));

        deferred.resolve();
    });

    return deferred.promise;
};

/**
 * Runs all the code
 * @returns {undefined}
 */
var runExtension = function () {
    var deferred = Q.defer();

    findHosts()
        .then(getAllHostdata)
        .then(enrichPage)
        .then(deferred.resolve);

    return deferred.promise;
};

jQuery(document).ready(runExtension);

if (typeof module !== 'undefined') {
    module.exports = {
        enrichPage: enrichPage,
        findHosts: findHosts,
        getAllHostdata: getAllHostdata,
        getHostdata: getHostdata,
        getIconSymbol: getIconSymbol,
        getLocationHTML: getLocationHTML,
        getURL: getURL,
        runExtension: runExtension
    };
}