class AsideNestedMenuTogglerDirective {

    constructor() {
        this._activeClassName = 'open';
        this._isOpen = false;
    }

    link(scope, element, attrs) {
        this._scope = scope;
        this._element = element;
        this._attrs = attrs;
        this._arrowElem = this._createArrow();
        const trigger = this._element[0].querySelector('a.navigation__link');


        trigger.append(this._arrowElem);

        if (attrs && attrs.activeClass) {
            this._activeClassName = attrs.activeClass;
        }
        if (attrs && typeof attrs.open !== 'undefined') {
            this._isOpen = true;
            this._element.addClass(this._activeClassName);
            this._makeArrowToUp();
        }

        if (trigger) {
            trigger.classList.add('navigation__link--collapse');
        }

        this._assignListeners();
    }

    _assignListeners() {
        const trigger = this._element[0].querySelector('a.navigation__link');
        trigger && trigger.addEventListener('click', this._clickHandler.bind(this));
    }

    _clickHandler(event) {
        this._isOpen = !this._isOpen;
        if (this._isOpen) {
            this._element.addClass(this._activeClassName);
            this._makeArrowToUp();
        } else {
            this._element.removeClass(this._activeClassName);
            this._makeArrowToDown();
        }
    }

    _createArrow() {
        const arrowElem = document.createElement('span');
        arrowElem.classList.add('fa');
        arrowElem.classList.add('arrow-icon');

        if (this._isOpen) {
            arrowElem.classList.add('fa-angle-up');
        } else {
            arrowElem.classList.add('fa-angle-down');
        }

        return arrowElem;
    }

    _resetArrow() {
        if (this._arrowElem) {
            this._arrowElem.classList.remove('fa-angle-up');
            this._arrowElem.classList.remove('fa-angle-down');
        }
    }

    _makeArrowToDown() {
        this._resetArrow();
        this._arrowElem.classList.add('fa-angle-down');
    }

    _makeArrowToUp() {
        this._resetArrow();
        this._arrowElem.classList.add('fa-angle-up');
    }

}

module.exports = function AsideNestedMenuTogglerDirFactory () {
    return new AsideNestedMenuTogglerDirective();
};
