# Sandbox Versions
[![Code Climate](https://codeclimate.com/github/pcon/sfdc-sandboxVersion/badges/gpa.svg)](https://codeclimate.com/github/pcon/sfdc-sandboxVersion)

*Shows your sandbox version next to your sandbox host*

Tired of having to manually look at what version your sandboxes are?  Well, let a computer do all that tedious work for you!  This extension will load an icon and alt text next to your instance name so you can see if the sandbox is a spring/summer/winter instance.

![Screenshot](https://raw.githubusercontent.com/pcon/sfdc-sandboxVersion/master/assets/screenshot.png)

# Installation
## Chrome
The extension can be installed directly from the [Chrome web store](https://chrome.google.com/webstore/detail/sandbox-version/lggmdcnfdkoogifabfihligfjinpaiom).
## Firefox
This add-on can be installed directly from the [Firefox Add-ons site](https://addons.mozilla.org/en-US/firefox/addon/sandbox-version/)
## Unmanaged
1.  Download the source
2.  Install the dev tools `npm install`
3.  Setup build environment `npm run setup`
4.  Build the extension
    1.  Chrome: `npm run build-chrome`
    2.  Firefox: `npm run build-firefox`
    3.  Both: `npm run build`
5.  Install unpacked extension
    1.  [Steps for Chrome](https://developer.chrome.com/extensions/getstarted)
    2.  [Steps for Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#Installing)