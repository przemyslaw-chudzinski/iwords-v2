const BaseController = require('./base-controller');
const {withSpeech} = require('../decorators/index');

class LearningSpeakingCrlFactory extends BaseController {

    constructor($scope, expressionSrv, $timeout) {
        super($scope);
        this.expressionSrv = expressionSrv;
        this.$timeout = $timeout;
    }

    initState() {
        super.initState();
        this.$scope.currentExprs = [];
        this.$scope.currentExpr = null;
        this.$scope.speechRecogantionSupport = false;
        this.$scope.speechRecording = false;
        this.$scope.sRecognition = null;
        this.$scope.answer = '';
        this.$scope.answerSuccess = false;
        this.$scope.answerWrong = false;
    }

    pageLoadedHook() {
        super.pageLoadedHook();
        this._initSpeechRecognition();
        this._fetchExpressions();
    }

    assignTemplateFunctions() {
        super.assignTemplateFunctions();
        this.$scope.handleSpeaking = this._handleSpeaking.bind(this);
    }

    _fetchExpressions() {
        this.expressionSrv.fetchExpressions(this._isRepeatState)
            .then(({data: {data}}) => {
                this.$scope.currentExprs = data;
                if (data && data.length) {
                    this.$scope.currentExpr = {
                        ...data[0],
                        refs: {
                            diki: `https://www.diki.pl/slownik-angielskiego?q=${data[0].expression}`
                        }
                    };
                }
            });
    }

    _initSpeechRecognition() {
        this.$scope.speechRecogantionSupport = IWORDS.SpeechRecognation.checkSupport();

        if (!this.$scope.speechRecogantionSupport) {
            return;
        }

        const SpeechRecognition = IWORDS.SpeechRecognation.getClass();
        this.$scope.sRecognition = new SpeechRecognition();
        this.$scope.sRecognition.lang = 'en-US';

        // Event listeners
        this.$scope.sRecognition.addEventListener('result', this._handleSpeechRecognitionRes.bind(this));
    }

    _handleSpeaking() {
        this.$scope.sRecognition.start();
        this.$scope.speechRecording = true;
    }

    _handleSpeechRecognitionRes(event) {
        this.$scope.answer = event.results[0][0].transcript.trim().toLowerCase();
        this.$scope.speechRecording = null;
        this.$scope.speechRecording = false;

        this.$scope.answer.trim().toLocaleLowerCase() === this.$scope.currentExpr.expression.trim().toLocaleLowerCase()
            ? this._handleCorrectAnswer() : this._handleIncorrectAnswer();
    }

    _handleCorrectAnswer() {
        this.$timeout(() => {
            this.$scope.answerSuccess = true;
        });

        this.speak(this.$scope.currentExpr.expression);

        /* Remove expression from stack */
        this.$scope.currentExprs = this.$scope.currentExprs.filter(expr => expr._id !== this.$scope.currentExpr._id);

        this.$timeout(() => {

            if (this.$scope.currentExprs.length) {

                this.expressionSrv.incrementAnswersCounter(this.$scope.currentExpr._id, true)
                    .then(() => {
                        this.$scope.answer = '';
                        this.$scope.answerSuccess = false;
                        this.$scope.currentExpr = this.$scope.currentExprs[0];
                        this.$scope.currentExpr = {
                            ...this.$scope.currentExprs[0],
                            refs: {
                                diki: `https://www.diki.pl/slownik-angielskiego?q=${this.$scope.currentExprs[0].expression}`
                            }
                        };
                    })
                    .catch(err => console.log('something went wrong', err));

            } else {
                /* Fetch next new word */
                this._fetchNextExpression(this._handleFetchNextExpression.bind(this), true, false);
            }

        }, 500);
    }

    _handleIncorrectAnswer() {
        this.$timeout(() => {
            this.$scope.answerWrong = true;
        });

        this.speak(this.$scope.currentExpr.expression);

        this.$timeout(() => {

            this.expressionSrv.incrementAnswersCounter(this.$scope.currentExpr._id, false)
                .then(() => {
                    this.$scope.answerWrong = false;
                    this.$scope.answer = '';
                })
                .catch(err => console.log('something went wrong', err));

        }, 2000);
    }

    _fetchNextExpression(next, correct, onlyRepeats) {
        next = next || function () {};

        this.expressionSrv.incrementAnswersCounter(this.$scope.currentExpr._id, correct, onlyRepeats)
            .then(() => {})
            .catch(err => console.log('something went wrong', err));

        this.expressionSrv.fetchExpressions(onlyRepeats)
            .then(({data: {data}}) => {
                this.$scope.currentExprs = data;
                if (data && data.length) {
                    this.$scope.currentExpr = {
                        ...data[0],
                        refs: {
                            diki: `https://www.diki.pl/slownik-angielskiego?q=${data[0].expression}`
                        }
                    };
                }
                next(null);
            })
            .catch(err => console.log('something went wrong', err));
    }

    _handleFetchNextExpression(err) {
        if (err) {
            /* Handle error */
            return;
        }

        this.$scope.answer = '';
        this.$scope.answerSuccess = false;
        this.$scope.skipping = false;
    }



}

module.exports = withSpeech(LearningSpeakingCrlFactory);
