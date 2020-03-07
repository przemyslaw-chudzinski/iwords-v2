const BaseController = require('./base-controller');
const {Speech, Expression} = require('../classes');

class LearningController extends BaseController {

    constructor($scope, expressionSrv, $timeout, $mdDialog, localStorageSrv) {
        super($scope);

        // setup
        this.expressionSrv = expressionSrv;
        this.$mdDialog = $mdDialog;
        this.$timeout = $timeout;
        this.localStorageSrv = localStorageSrv;
        this._speech = new Speech();

        // init state
        this.$scope.currentExprs = [];
        this.$scope.currentExpr = null;
        this.$scope.answer = '';
        this.$scope.answerSuccess = false;
        this.$scope.answerWrong = false;
        this.$scope.skipping = false;
        this.$scope.repeatCount = 0;
        this.$scope.repeatState = {
            state: this.localStorageSrv.hasRepeatState()
        };
        this.$scope.expressionsInRepeatMode = [];
        this.$scope.speechState = {
            state: this.localStorageSrv.speechStateIsOn()
        };

        // assign template functions
        this.$scope.handleKeyPress = this._handleKeyPress.bind(this);
        this.$scope.openMenu = ($mdMenu, event) => $mdMenu.open(event);
        this.$scope.handleResetRepeatMode = event => this._confirmResetRepeatMode(event).then(this._resetRepeatMode.bind(this));
        this.$scope.skipExpression = this._skipExpression.bind(this);
        this.$scope.handleRepeatStateModeChange = this._handleRepeatStateModeChange.bind(this);
        this.$scope.handleSelectTab = this._handleSelectTab.bind(this);
        this.$scope.handleRemoveExprFromRepeatMode = this._handleRemoveExprFromRepeatMode.bind(this);
        this.$scope.calcRepeatCountProgress = () => Math.round(+this.$scope.currentExpr.repeatCorrectAnswers / 10 * 100);
        this.$scope.pronounciation = (txt = null) => this._speech.speak(txt || this.$scope.currentExpr.expression);
        this.$scope.handleSpeechStateChange = this._handleSpeechStateChange.bind(this);

        this._speech.canSpeak = this.$scope.speechState.state;

    }

    pageLoadedHook() {
        super.pageLoadedHook();
        this._answerInputElem = document.querySelector('.input');
        this._focusAnswerInput();
        this._fetchExpressions();
        this._fetchRepeatCount();
    }

    /**
     * @desc - It fetches expressions for learning
     * @private
     */
    _fetchExpressions() {
        return this.expressionSrv.fetchExpressions({onlyRepeats: this.$scope.repeatState.state})
            .then(({data: {data}}) => {
                if (data && data.length) {
                    this.$scope.currentExprs = data.map(expression => new Expression(expression));
                    this.$scope.currentExpr = this.$scope.currentExprs[0];
                    return;
                }
                if (this.$scope.repeatState.state) {
                    this.$scope.repeatState = {state: false};
                    this.localStorageSrv.repeatStateOff();
                    this._fetchExpressions();
                }
            });
    }

    /**
     * @desc - fetches how many expressions is in repeat state
     * @private
     */
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

    /**
     * @desc - It handles keypress events
     * @param keyCode
     */
    _handleKeyPress({keyCode}) {
        if (keyCode === 13) {
            this._disableAnswerInput();
            this._checkAnswer() ? this._handleCorrectAnswer() : this._handleIncorrectAnswer();
        }
    }

    /**
     * @desc - it checks if answer is correct
     * @return {boolean}
     * @private
     */
    _checkAnswer() {
        return this.$scope.answer.trim().toLocaleLowerCase() ===
            this.$scope.currentExpr.expression.trim().toLocaleLowerCase();
    }

    /**
     * @desc - It handles when answer is correct
     * @private
     */
    _handleCorrectAnswer() {
        // Speak current expression
        this._speech.speak(this.$scope.currentExpr.expression);

        // Make input green
        this.$scope.answerSuccess = true;

        // Mark that the current expression has been used
        // Increment answer counter
        this.$scope.currentExpr.handleCorrectAnswer();

        // Request - Increment answer counter
        this.expressionSrv.incrementAnswersCounter({expressionId: this.$scope.currentExpr.id})
            .then(() => this._fetchRepeatCount());

        this.$timeout(() => {
            const nextExprIndex = this._getNextExpression();

            if (nextExprIndex) {
                this._resetInput();
                this.$scope.currentExpr = this.$scope.currentExprs[nextExprIndex];
                return;
            }

            this._fetchExpressions()
                .then(() => this._resetInput());

        }, 500);
    }

    /**
     * @desc - It handles when answer ins incorrect
     * @private
     */
    _handleIncorrectAnswer() {
        // Speak current expression
        this._speech.speak(this.$scope.currentExpr.expression);

        // Make input read
        this.$scope.answerWrong = true;

        // Mark that the current expression has been used
        // Increment answer counter
        this.$scope.currentExpr.handleIncorrectAnswer();

        // Increment repeatCount property
        // this.$scope.repeatCount++;


        // Request - Increment answer counter
        this.expressionSrv.incrementAnswersCounter({expressionId: this.$scope.currentExpr.id, correct: false})
            .then(() => this._fetchRepeatCount());

        this.$timeout(() => this._resetInput(), 2000);
    }

    /**
     * @desc - it returns next expression index
     * @private
     * @return {null | number}
     */
    _getNextExpression() {
        // Check if all expressions was used
        // if not return first unused expression
        // if all were used then fetch the next expressions
        const usedExprIndexes = [];
        const unusedExprIndexes = [];
        if (this.$scope.currentExprs && this.$scope.currentExprs.length) {
            this.$scope.currentExprs.forEach((expr, index) => {
                expr.used ? usedExprIndexes.push(index) : unusedExprIndexes.push(index);
            });
        }
        return unusedExprIndexes.length ? unusedExprIndexes[0] : null;
    }

    /**
     * @desc - It resets the answer input
     * @private
     */
    _resetInput() {
        this.$scope.answer = '';
        this.$scope.answerSuccess = false;
        this.$scope.answerWrong = false;
        this._enableAnswerInputAndFocus();
    }

    /**
     * @desc - Resets repeat mode
     * @private
     */
    _resetRepeatMode() {
        this.expressionSrv.resetRepeatMode()
            .then(() => {
                this.$scope.repeatState = {state: false};
                this.localStorageSrv.clearRepeatState();
                this.$scope.expressionsInRepeatMode = [];
                this.$scope.repeatCount = 0;
                if (this.$scope.currentExprs.length) {
                   const nextExprIndex = this._getNextExpression();
                   if (nextExprIndex) {
                       this._resetInput();
                       this.$scope.currentExpr = this.$scope.currentExprs[nextExprIndex];
                       return;
                   }
                   this._fetchExpressions();
                }
            })
            .catch(err => console.log('resetRepeatMode error', err));
    }

    /**
     * @desc - Prepares and shows the confirm reset repeat state dialog
     * @param event
     * @return {*}
     * @private
     */
    _confirmResetRepeatMode(event) {
            const confirm = this.$mdDialog.confirm()
                .title('Czy na pewno chcesz zresetować tryb powtórek?')
                .textContent('Jeśli zresetujesz tryb powtórek, wszystkie wyrażenia z powtórek zostaną usunięte')
                .targetEvent(event)
                .ok('Tak, chcę zrestować powtórki')
                .cancel('Anuluj');

            return this.$mdDialog.show(confirm);
    }

    /**
     * @desc - the skip expression handler
     * @private
     */
    _skipExpression() {
        this.$scope.currentExpr.markAsUsed();
        const nextExprIndex = this._getNextExpression();
        if (nextExprIndex) {
            this.$scope.currentExpr = this.$scope.currentExprs[nextExprIndex];
            return;
        }
        this._fetchExpressions()
    }

    /**
     * @desc - it makes the answer input focused
     * @private
     */
    _focusAnswerInput() {
        this._answerInputElem && this._answerInputElem.focus();
    }

    /**
     * @desc - It makes the answer input disabled
     * @private
     */
    _disableAnswerInput() {
        if (this._answerInputElem) {
            this._answerInputElem.disabled = true;
        }
    }

    /**
     * @desc - It makes the answer input enabled
     * @private
     */
    _enableAnswerInputAndFocus() {
        if (this._answerInputElem) {
            this._answerInputElem.disabled = false;
            this._answerInputElem.focus();
        }
    }

    /**
     * @desc It handles repeat state change
     * @private
     */
    _handleRepeatStateModeChange() {
        this.$scope.repeatState.state ? this.localStorageSrv.repeatStateOn() : this.localStorageSrv.repeatStateOff();
        this._fetchExpressions();
    }

    /**
     * @desc - TABS select tab handler
     * @param key
     * @param event
     * @private
     */
    _handleSelectTab(key, event) {
        switch (key) {
            case 'learning': break;
            case 'repeats': this._fetchExpressionsInRepeatMode(); break;
        }
    }

    /**
     * @desc - EXPRESSIONS IN REPEAT TAB - It fetches expressions in repeat mode
     * @return {*}
     * @private
     */
    _fetchExpressionsInRepeatMode() {
        return this.expressionSrv.fetchExpressionsInRepeatMode()
            .then(res => {
                this.$scope.expressionsInRepeatMode = res.data.data.map(expr => new Expression(expr));
            })
            .catch(() => console.log('something went wrong'));
    }

    /**
     * @desc - EXPRESSIONS IN REPEAT TAB - It removes single expression from repeat state
     * @param exprId
     * @param event
     * @private
     */
    _handleRemoveExprFromRepeatMode(exprId, event) {
        const config = {exprId};

        this.expressionSrv.removeExpressionFromRepeatMode(config)
            .then(() => {
                this._fetchRepeatCount();
                this.$scope.expressionsInRepeatMode = this.$scope.expressionsInRepeatMode.filter(item => item.id !== exprId);
                this._fetchExpressions();
            })
            .catch(err => console.log('something went wrong', err));
    }

    /**
     * @desc - It handles when the speech state is changed
     * @private
     */
    _handleSpeechStateChange() {
        this._speech.canSpeak = this.$scope.speechState.state;
        this.$scope.speechState.state ? this.localStorageSrv.speechStateOn() : this.localStorageSrv.speechStateOff();
    }

}

module.exports = LearningController;

