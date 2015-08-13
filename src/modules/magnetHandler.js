/* This js module doesn't export anything, it's meant to handle the protocol registration/unregistration */
var EXPORTED_SYMBOLS = ['MagnetHandler'];
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import('resource://SynoLoader/Util.js');

var manager = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);

// our XPCOM components to handle the protocols
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

function Magnet_ProtocolWrapper () {
    var myHandler = function () {};

    myHandler.prototype = {
        QueryInterface: XPCOMUtils.generateQI([Ci.nsIProtocolHandler]),

        _xpcom_factory: {
            singleton: null,
            createInstance: function (aOuter, aIID) {
                if (aOuter) throw Components.results.NS_ERROR_NO_AGGREGATION;

                if (!this.singleton) this.singleton = new myHandler();
                return this.singleton.QueryInterface(aIID);
            }
        },

        // nsIProtocolHandler implementation:

        // default attributes
        protocolFlags: Ci.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE,
        defaultPort: -1,

        newURI: function (aSpec, aCharset, aBaseURI) {
            var uri = Cc['@mozilla.org/network/simple-uri;1']
                .createInstance(Ci.nsIURI);
            uri.spec = aSpec;
            return uri;
        },

        newChannel: function (aURI) {
            var observerService = Cc['@mozilla.org/observer-service;1']
                .getService(Ci.nsIObserverService);
            observerService.notifyObservers(aURI, 'magnet-on-open-uri', 'magnet');

            // create dummy nsIURI and nsIChannel instances
            var ios = Cc['@mozilla.org/network/io-service;1']
                .getService(Ci.nsIIOService);
            /*jshint scripturl:true*/
            return ios.newChannel('javascript:void()', null, null);
        },
        scheme: 'magnet',
        classDescription: 'Torrent Magnet Handler',
        classID: Components.ID('{6dfabfd0-0aba-11e1-be50-0800200c9a66}'),
        contractID: '@mozilla.org/network/protocol;1?name=magnet'
    };

    return myHandler;
}

// This function takes care of register/unregister the protocol handlers as requested
// It's called when the preferences change.
var MagnetHandler = {};

MagnetHandler.set_active = function (activate) {

    Util.log('Synoloader: attempting to register protocol');

    try {
        var protocolHandler = Magnet_ProtocolWrapper();
        var proto = protocolHandler.prototype;

        if (activate) {
            Util.log('Synoloader: enabling');
            if (! protocolHandler.registered && !manager.isCIDRegistered(proto.classID))
                manager.registerFactory(proto.classID,
                    proto.classDescription,
                    proto.contractID,
                    proto._xpcom_factory);

            protocolHandler.registered = true;
        } else {
            Util.log('Synoloader: disabling');
            if (protocolHandler.registered)
                manager.unregisterFactory(proto.classID, proto._xpcom_factory);
            protocolHandler.registered = false;
        }

    } catch (e) {
        Util.log('Synoloader: error ' + e);
    }
};

MagnetHandler.createObserver = function () {
    return ({
        observe: function (subject, topic, data) {},
        QueryInterface: function (iid) {
            if (!iid.equals(Ci.nsIObserver) &&
                !iid.equals(Ci.nsISupportsWeakReference) &&
                !iid.equals(Ci.nsISupports)) {
                throw Components.results.NS_ERROR_NO_INTERFACE;
            }
            return this;
        }
    });
};
