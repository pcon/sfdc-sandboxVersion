var axios = jest.genMockFromModule('axios');

var results = {};

/**
 * Sets the mock data
 * @param {Object} resultMap A map of hostname to data
 * @returns {undefined}
 */
var __setMockResults = function (resultMap) {
    results = resultMap;
};

/**
 * Gets the data for a given hostname
 * @param {String} url The URL
 * @returns {Promise} A promise for the data
 */
var get = function (url) {
    var hostname = url.match(/^https:\/\/api.status.salesforce.com\/v1\/instances\/(.*)\/status\/preview$/)[1];

    return new Promise(function (resolve, reject) {
        if (hostname in results) {
            resolve({ data: results[hostname] });
        } else {
            reject('I AM ERROR');
        }
    });
};

axios.__setMockResults = __setMockResults;
axios.get = get;

module.exports = axios;