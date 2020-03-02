const ServiceBase = require('./service-base');

/* Statistics service */
class LocalStorageService extends ServiceBase {

    constructor() {
        super();
        this._checkSupport();
    }

    _checkSupport() {
        if (!('localStorage' in window)) {
            throw new Error('local storage is not supported');
        }
        this._ls = localStorage;
    }

    /**
     * Repeat state
     */

    repeatStateOn() {
        this._ls.setItem('onlyRepeats', '1');
    }

    repeatStateOff() {
        this._ls.removeItem('onlyRepeats');
    }

    hasRepeatState() {
        return this._ls.getItem('onlyRepeats') === '1';
    }

    /**
     * Aside
     */

    asideOpened() {
        this._ls.setItem('asideOpened', '1');
    }

    asideClosed() {
        this._ls.removeItem('asideOpened');
    }

    asideIsOpened() {
        return this._ls.getItem('asideOpened') === '1';
    }

    /**
     * Speech - primary learning mode
     */

    speechStateOn() {
        this._ls.setItem('speechState', '1');
    }

    speechStateOff() {
        this._ls.removeItem('speechState');
    }

    speechStateIsOn() {
        return this._ls.getItem('speechState') === '1';
    }

}

module.exports = function LocalStorageSrvFactory() {
    return new LocalStorageService();
};
