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

    get repeatState() {
        return this._ls.getItem('onlyRepeats');
    }

    set repeatState(value) {
        this._ls.setItem('onlyRepeats', value);
    }

    clearRepeatState() {
        this._ls.removeItem('onlyRepeats');
    }

    asideOpened() {
        this._ls.setItem('asideOpened', '1');
    }

    asideClosed() {
        this._ls.removeItem('asideOpened');
    }

    asideIsOpened() {
        return this._ls.getItem('asideOpened') === '1';
    }

}

module.exports = function LocalStorageSrvFactory() {
    return new LocalStorageService();
};
