IWORDS.SpeechRecognation = (function () {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const checkSupport = () => !!SpeechRecognition;

    const getClass = () => SpeechRecognition;

    return {
        checkSupport,
        getClass
    };

})();
