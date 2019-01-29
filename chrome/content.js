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
function getSandboxTable() {
    return jQuery(`table[id^=${SELECTOR_TABLE}]`);
}

/**
 * Acts on each of the locations
 * @param {function} callback The method to call with each of the spans
 * @returns {undefined}
 */
function actOnLocations(callback) {
    getSandboxTable().find(`span[id$=${SELECTOR_LOCATION}]`).each(callback);
}

/**
 * Finds all the hosts
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
function getURL(instance_name) {
    return `https://api.status.salesforce.com/v1/instances/${instance_name}/status/preview`;
}

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
        }).catch(function (error) {
            deferred.reject(error);
        });

    return deferred.promise;
};

/**
 * Gets the icon symbol
 * @param {String} releaseVersion The release version
 * @returns {String} The icon
 */
function getIconSymbol(releaseVersion) {
    var releaseName = releaseVersion.toLowerCase().split(' ')[0];

    return releaseName in ICON_MAP ? ICON_MAP[releaseName] : ICON_UNKNOWN;
}

/**
 * Gets the HTML for the location column
 * @param {Object} instance_data The instance data
 * @returns {string} The HTML to display
 */
function getLocationHTML(instance_data) {
    return `<span title="${instance_data.releaseVersion}">${getIconSymbol(instance_data.releaseVersion)}</span> ${instance_data.key}`;
}

/**
 * Enrich the page with the host data
 * @param {Object} instance_map A map of instance name to instance data
 * @return {Promise} A promise for when the page is enriched
 */
var enrichPage = function (instance_map) {
    var deferred = Q.defer();

    actOnLocations(function () {
        var instance = jQuery(this).text();
        jQuery(this).html(getLocationHTML(instance_map[instance]));
    });

    deferred.resolve();

    return deferred.promise;
};

findHosts()
    .then(getAllHostdata)
    .then(enrichPage);