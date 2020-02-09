class AsideNestedMenuTogglerDirective {

    constructor() {
        this._activeClassName = 'open';
        this._isOpen = false;
    }

    link(scope, element, attrs) {
        this._scope = scope;
        this._element = element;
        this._attrs = attrs;
        if (attrs && attrs.activeClass) {
            this._activeClassName = attrs.activeClass;
        }
        if (attrs && typeof attrs.open !== 'undefined') {
            this._isOpen = true;
            this._element.addClass(this._activeClassName);
        }

        this._assignListeners();
    }

    _assignListeners() {
        this._element.on('click', this._clickHandler.bind(this));
    }

    _clickHandler(event) {
        if (event.target.parentNode !== this._element[0]) {
            return;
        }
        this._isOpen = !this._isOpen;
        if (this._isOpen) {
            this._element.addClass(this._activeClassName);
        } else {
            this._element.removeClass(this._activeClassName);
        }
    }

}

module.exports = function AsideNestedMenuTogglerDirFactory () {
    return new AsideNestedMenuTogglerDirective();
};
