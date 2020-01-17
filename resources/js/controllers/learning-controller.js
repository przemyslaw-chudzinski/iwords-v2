module.exports = class LearningCtrlFactory {

    constructor($scope, expressionSrv, $timeout, $mdDialog, localStorageSrv) {
        this._$scope = $scope;
        this._expressionSrv = expressionSrv;
        this._$mdDialog = $mdDialog;
        this._$timeout = $timeout;
        this._localStorageSrv = localStorageSrv;

        this._initState();
        this._init();
        this._assignTemplateFunctions();
    }

    _initState() {
        this._$scope.currentExprs = [];
        this._$scope.currentExpr = null;
        this._$scope.answer = '';
        this._$scope.answerSuccess = false;
        this._$scope.answerWrong = false;
        this._$scope.skipping = false;
        this._$scope.repeatCount = 0;
        this._$scope.repeatState = {
            state: false
        };

        this._answerInputElem = document.querySelector('.input');
    }

    _init() {
        this._focusAnswerInput();
        this._checkRepeatState();
        this._fetchExpressions();
        this._fetchRepeatCount();
    }

    _assignTemplateFunctions() {
        this._$scope.handleKeyPress = this._handleKeyPress.bind(this);
        this._$scope.openMenu = this._openMenu.bind(this);
        this._$scope.handleResetRepeatMode = this._handleResetRepeatMode.bind(this);
        this._$scope.hasExampleSentences = this._hasExampleSentences.bind(this);
        this._$scope.skipExpression = this._skipExpression.bind(this);
        this._$scope.handleRepeatStateModeChange = this._handleRepeatStateModeChange.bind(this);
    }

    _focusAnswerInput() {
        this._answerInputElem && this._answerInputElem.focus();
    }

    _checkRepeatState() {
        if (this._isRepeatState) {
            this._$scope.repeatState = {state: true};
        }
    }

    get _isRepeatState() {
        return !!this._localStorageSrv.repeatState;
    }

    _fetchExpressions() {
        this._expressionSrv.fetchExpressions(this._isRepeatState)
            .then(({data: {data}}) => {
                this._$scope.currentExprs = data;
                if (data && data.length) {
                    this._$scope.currentExpr = {
                        ...data[0],
                        refs: {
                            diki: `https://www.diki.pl/slownik-angielskiego?q=${data[0].expression}`
                        }
                    };
                }
            });
    }

    _fetchRepeatCount() {
        this._expressionSrv.fetchRepeatCount()
            .then(({data: {repeatCount}}) => {
                this._$scope.repeatCount = repeatCount;
            })
            .catch(err => {
                this._$scope.repeatCount = 0;
                console.log('something went wrong', err);
            });
    }

    _handleKeyPress({keyCode}) {
        if (keyCode === 13) {
            this._disableAnswerInput();
            this._$scope.answer.trim() === this._$scope.currentExpr.expression.trim() ? this._handleCorrectAnswer() : this._handleIncorrectAnswer();
        }
    }

    _handleCorrectAnswer() {
        this._$scope.answerSuccess = true;

        /* Remove expression from stack */
        this._$scope.currentExprs = this._$scope.currentExprs.filter(expr => expr._id !== this._$scope.currentExpr._id);

        this._$timeout(() => {

            if (this._$scope.currentExprs.length) {

                this._expressionSrv.incrementAnswersCounter(this._$scope.currentExpr._id, true)
                    .then(() => {
                        this._$scope.answer = '';
                        this._$scope.answerSuccess = false;
                        this._$scope.currentExpr = this._$scope.currentExprs[0];
                        this._$scope.currentExpr = {
                            ...this._$scope.currentExprs[0],
                            refs: {
                                diki: `https://www.diki.pl/slownik-angielskiego?q=${this._$scope.currentExprs[0].expression}`
                            }
                        };

                        this._fetchRepeatCount();
                        this._enableAnswerInputAndFocus();

                    })
                    .catch(err => console.log('something went wrong', err));

            } else {
                /* Fetch next new word */
                this._fetchNextExpression(this._handleFetchNextExpression.bind(this), true, this._$scope.repeatState.state);
            }

        }, 500);
    }

    _handleIncorrectAnswer() {
        this._$scope.answerWrong = true;

        this._$timeout(() => {

            this._expressionSrv.incrementAnswersCounter(this._$scope.currentExpr._id, false)
                .then(() => {
                    this._$scope.answerWrong = false;
                    this._$scope.answer = '';

                    this._fetchRepeatCount();
                    this._enableAnswerInputAndFocus();
                })
                .catch(err => console.log('something went wrong', err));

        }, 2000);
    }

    _fetchNextExpression(next, correct, onlyRepeats) {
        next = next || function () {};

        this._expressionSrv.incrementAnswersCounter(this._$scope.currentExpr._id, correct, onlyRepeats)
            .then(() => {})
            .catch(err => console.log('something went wrong', err));

        this._expressionSrv.fetchExpressions(onlyRepeats)
            .then(({data: {data}}) => {
                this._$scope.currentExprs = data;
                if (data && data.length) {
                    this._$scope.currentExpr = {
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
        this._expressionSrv.resetRepeatMode()
            .then(() => {
                this._$scope.repeatState = {
                    state: false
                };

                this._localStorageSrv.clearRepeatState();
                this._fetchNextExpression(this._handleFetchNextExpression.bind(this));
            })
            .catch(err => console.log('resetRepeatMode error', err));
    }

    _confirmResetRepeatMode(event) {
            const confirm = this._$mdDialog.confirm()
                .title('Czy na pewno chcesz zresetować tryb powtórek?')
                .textContent('Jeśli zresetujesz tryb powtórek, wszystkie wyrażenia z powtórek zostaną usunięte')
                .targetEvent(event)
                .ok('Tak, chcę zrestować powtórki')
                .cancel('Anuluj');

            return this._$mdDialog.show(confirm);
    }

    _hasExampleSentences() {
        return this._$scope.currentExpr && this._$scope.currentExpr.exampleSentences && this._$scope.currentExpr.exampleSentences.length;
    }

    _skipExpression() {
        this._fetchNextExpression(this._handleFetchNextExpression.bind(this), false, this._$scope.repeatState.state);
    }

    _disableAnswerInput() {
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

        this._$scope.answer = '';
        this._$scope.answerSuccess = false;
        this._$scope.skipping = false;

        this._fetchRepeatCount();
        this._enableAnswerInputAndFocus();
    }

    _handleRepeatStateModeChange() {
        if (this._$scope.repeatState.state) {
            this._localStorageSrv.repeatState = this._$scope.repeatState.state;
        } else {
            this._localStorageSrv.clearRepeatState();
        }
        this._fetchNextExpression(this._handleFetchNextExpression.bind(this), true, this._$scope.repeatState.state);
    }

};
