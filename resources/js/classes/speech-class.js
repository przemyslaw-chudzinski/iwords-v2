class Speech {

    constructor() {
        this._speechSynthesisUtterance = null;
        this._canSpeak = true;

        this._loadVoices()
            .then(voices => {
                this._speechSynthesisUtterance = new SpeechSynthesisUtterance();
                this._speechSynthesisUtterance.voice = this._getENGVoice(voices)();
                speechSynthesis.cancel();
            });
    }

    get canSpeak() {
        return this._canSpeak;
    }

    set canSpeak(value) {
        this._canSpeak = value;
    }

    speak(txt) {
        if (this.checkSupport() && this._canSpeak) {
            this._speechSynthesisUtterance.text = txt;
            speechSynthesis.speak(this._speechSynthesisUtterance);
        }
    }

    checkSupport() {
        return 'SpeechSynthesisUtterance' in window;
    }

    _loadVoices() {
        return new Promise(resolve => {

            const interval = setInterval(() => {

                const voices = speechSynthesis.getVoices();

                if (voices.length) {
                    resolve(voices);
                    clearInterval(interval);
                }

            }, 100);

        });
    }

    _getENGVoice(voices = []) {
        let _voice = null;
        return () => {
            if (voices && voices.length && !_voice) {
                voices.forEach(voice => {
                    if (voice.lang === 'en-US' && !_voice) {
                        _voice = voice;
                        return;
                    }
                });
            }
            return _voice;
        };
    }

}

module.exports = Speech;
