class ExpressionSentenceTogglerDirective {
    constructor() {
        this._className = 'active';
        this._triggerActiveLabel = 'ukryj';
        this._triggerInactiveLabel = 'zoabcz';
    }

    link(scope, element, attrs) {
        this._scope = scope;
        this._element = element;
        this._attrs = attrs;
        this._assignElements();
        this._assignListeners();
    }

    _assignElements() {
        this._triggerElem = this._element.find('span');
    }

    _assignListeners() {
        this._triggerElem && this._triggerElem.length && this._triggerElem.on('click', this._triggerElemClickHandler.bind(this));
    }

    _triggerElemClickHandler(event) {
        const element = event.target.parentNode;
        if (element.classList.contains(this._className)) {
            element.classList.remove(this._className);
            event.target.innerText =this._triggerInactiveLabel;
        } else {
            element.classList.add(this._className);
            event.target.innerText = this._triggerActiveLabel;
        }
    }

}

module.exports = function ExpressionSentenceTogglerDirFactory () {
    return new ExpressionSentenceTogglerDirective();
};
