const {withSpeech} = require('../decorators/index');
const BaseController = require('./base-controller');

class LearningCtrlFactory extends BaseController {

    constructor($scope, expressionSrv, $timeout, $mdDialog, localStorageSrv) {
        super($scope);
        this.expressionSrv = expressionSrv;
        this.$mdDialog = $mdDialog;
        this.$timeout = $timeout;
        this.localStorageSrv = localStorageSrv;

    }

    initState() {
        super.initState();
        this.$scope.currentExprs = [];
        this.$scope.currentExpr = null;
        this.$scope.answer = '';
        this.$scope.answerSuccess = false;
        this.$scope.answerWrong = false;
        this.$scope.skipping = false;
        this.$scope.repeatCount = 0;
        this.$scope.repeatState = {
            state: false
        };
        this.$scope.expressionsInRepeatMode = [];
    }

    pageLoadedHook() {
        super.pageLoadedHook();
        this._answerInputElem = document.querySelector('.input');
        this._focusAnswerInput();
        this._checkRepeatState();
        this._fetchExpressions();
        this._fetchRepeatCount();
    }

    assignTemplateFunctions() {
        super.assignTemplateFunctions();
        this.$scope.handleKeyPress = this._handleKeyPress.bind(this);
        this.$scope.openMenu = this._openMenu.bind(this);
        this.$scope.handleResetRepeatMode = this._handleResetRepeatMode.bind(this);
        this.$scope.hasExampleSentences = this._hasExampleSentences.bind(this);
        this.$scope.skipExpression = this._skipExpression.bind(this);
        this.$scope.handleRepeatStateModeChange = this._handleRepeatStateModeChange.bind(this);
        this.$scope.handleSelectTab = this._handleSelectTab.bind(this);
        this.$scope.handleRemoveExprFromRepeatMode = this._handleRemoveExprFromRepeatMode.bind(this);
    }

    _focusAnswerInput() {
        this._answerInputElem && this._answerInputElem.focus();
    }

    _checkRepeatState() {
        if (this._isRepeatState) {
            this.$scope.repeatState = {state: true};
        }
    }

    get _isRepeatState() {
        return !!this.localStorageSrv.repeatState;
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

    _fetchRepeatCount() {
        this.expressionSrv.fetchRepeatCount()
            .then(({data: {repeatCount}}) => {
                this.$scope.repeatCount = repeatCount;
            })
            .catch(err => {
                this.$scope.repeatCount = 0;
                console.log('something went wrong', err);
            });
    }

    _handleKeyPress({keyCode}) {
        if (keyCode === 13) {
            this._disableAnswerInput();
            this.$scope.answer.trim() === this.$scope.currentExpr.expression.trim() ? this._handleCorrectAnswer() : this._handleIncorrectAnswer();
        }
    }

    _handleCorrectAnswer() {
        this.$scope.answerSuccess = true;

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

                        this._fetchRepeatCount();
                        this._enableAnswerInputAndFocus();

                    })
                    .catch(err => console.log('something went wrong', err));

            } else {
                /* Fetch next new word */
                this._fetchNextExpression(this._handleFetchNextExpression.bind(this), true, this.$scope.repeatState.state);
            }

        }, 500);
    }

    _handleIncorrectAnswer() {
        this.$scope.answerWrong = true;

        this.speak(this.$scope.currentExpr.expression);

        this.$timeout(() => {

            this.expressionSrv.incrementAnswersCounter(this.$scope.currentExpr._id, false)
                .then(() => {
                    this.$scope.answerWrong = false;
                    this.$scope.answer = '';

                    this._fetchRepeatCount();
                    this._enableAnswerInputAndFocus();
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

    _openMenu($mdMenu, event) {
        $mdMenu.open(event);
    }

    _handleResetRepeatMode(event) {
        this._confirmResetRepeatMode(event)
            .then(this._resetRepeatMode.bind(this), () => {});
    }

    _resetRepeatMode() {
        this.expressionSrv.resetRepeatMode()
            .then(() => {
                this.$scope.repeatState = {
                    state: false
                };

                this.localStorageSrv.clearRepeatState();
                this.$scope.expressionsInRepeatMode = [];
                this._fetchNextExpression(this._handleFetchNextExpression.bind(this));
            })
            .catch(err => console.log('resetRepeatMode error', err));
    }

    _confirmResetRepeatMode(event) {
            const confirm = this.$mdDialog.confirm()
                .title('Czy na pewno chcesz zresetować tryb powtórek?')
                .textContent('Jeśli zresetujesz tryb powtórek, wszystkie wyrażenia z powtórek zostaną usunięte')
                .targetEvent(event)
                .ok('Tak, chcę zrestować powtórki')
                .cancel('Anuluj');

            return this.$mdDialog.show(confirm);
    }

    _hasExampleSentences() {
        return this.$scope.currentExpr && this.$scope.currentExpr.exampleSentences && this.$scope.currentExpr.exampleSentences.length;
    }

    _skipExpression() {
        this._fetchNextExpression(this._handleFetchNextExpression.bind(this), false, this.$scope.repeatState.state);
    }

    _disableAnswerInput() {
        console.log('test');
        if (this._answerInputElem) {
            this._answerInputElem.disabled = true;
        }
    }

    _enableAnswerInputAndFocus() {
        if (this._answerInputElem) {
            this._answerInputElem.disabled = false;
            this._answerInputElem.focus();
        }
    }

    _handleFetchNextExpression(err) {
        if (err) {
            /* Handle error */
            return;
        }

        this.$scope.answer = '';
        this.$scope.answerSuccess = false;
        this.$scope.skipping = false;

        this._fetchRepeatCount();
        this._enableAnswerInputAndFocus();
    }

    _handleRepeatStateModeChange() {
        if (this.$scope.repeatState.state) {
            this.localStorageSrv.repeatState = this.$scope.repeatState.state;
        } else {
            this.localStorageSrv.clearRepeatState();
        }
        this._fetchNextExpression(this._handleFetchNextExpression.bind(this), true, this.$scope.repeatState.state);
    }

    _fetchExpressionsInRepeatMode() {
        return this.expressionSrv.fetchExpressionsInRepeatMode()
            .then(res => {
                this.$scope.expressionsInRepeatMode = res.data.data;
            })
            .catch();
    }

    _handleSelectTab(key, event) {
        switch (key) {
            case 'learning': break;
            case 'repeats': this._handleRepeatsTabSelection(); break;
        }
    }

    _handleRepeatsTabSelection() {
        this._fetchExpressionsInRepeatMode();
    }

    _handleRemoveExprFromRepeatMode(exprId, event) {
        const config = {
            exprId
        };
        this.expressionSrv.removeExpressionFromRepeatMode(config)
            .then(() => {
                this._fetchRepeatCount();
                this.$scope.expressionsInRepeatMode = this.$scope.expressionsInRepeatMode.filter(item => item._id !== exprId);
                this._fetchExpressions();
            })
            .catch(err => console.log('something went wrong', e));
    }

}

module.exports = withSpeech(LearningCtrlFactory);

