module.exports = superclass => {

    return class extends superclass {

        assignTemplateFunctions() {
            super.assignTemplateFunctions();
        }

        speak(txt, config = {}) {

            const _config = {
                volume: 1,
                rate: 1,
                pitch: 1,
                ...config
            };

            if (!('SpeechSynthesisUtterance' in window)) {
                return;
            }

            this._loadVoices()
                .then(voices => {
                    const _speechSynthesisUtterance = new SpeechSynthesisUtterance();
                    _speechSynthesisUtterance.voice = this._getENGVoice(voices)();
                    speechSynthesis.cancel();
                    _speechSynthesisUtterance.text = txt;
                    // _speechSynthesisUtterance.onerror = this.onVoiceErrorHandler.bind(this);
                    speechSynthesis.speak(_speechSynthesisUtterance);
                });
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

    };


};
