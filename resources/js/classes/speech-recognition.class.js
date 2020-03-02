const SpeechRecognitionObject = window.SpeechRecognition || window.webkitSpeechRecognition;

const defaultContext = {
    onResult: () => {}
};

/**
 * SpeechRecognation wrapper
 */
class SpeechRecognition {

    constructor(ctx = defaultContext) {
        this._ctx = ctx;
        this._sr = null;
        if (this.checkSupport()) {
            this._sr = new SpeechRecognitionObject();
            this._sr.lang = 'en-US';
            this._assignEvents();
        }
    }

    checkSupport() {
        return !!SpeechRecognition;
    }

    start() {
        this._sr && this._sr.start();
    }

    _assignEvents() {
        this._sr.addEventListener('result', this._handleSrResult.bind(this));
    }

    _handleSrResult(event) {
        const answer = event.results[0][0].transcript.trim().toLowerCase();
        this._ctx.onResult.call(this, answer);
    }
}

module.exports = SpeechRecognition;
