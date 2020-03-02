const BaseController = require('./base-controller');
const {Expression, Speech, SpeechRecognition} = require('../classes');

class LearningSpeakingController extends BaseController {

    constructor($scope, expressionSrv, $timeout) {
        super($scope);

        // setup
        this.expressionSrv = expressionSrv;
        this.$timeout = $timeout;
        this._speach = new Speech();
        this._speachRecognition = new SpeechRecognition({
            onResult: this._checkAnswer.bind(this)
        });

        // init state
        this.$scope.currentExprs = [];
        this.$scope.currentExpr = null;
        this.$scope.speechRecogantionSupport = this._speachRecognition.checkSupport();
        this.$scope.speechRecording = false;
        this.$scope.sRecognition = null;
        this.$scope.answer = '';
        this.$scope.answerSuccess = false;
        this.$scope.answerWrong = false;

        // assign template functions
        this.$scope.handleSpeaking = this._handleSpeaking.bind(this);
    }

    pageLoadedHook() {
        super.pageLoadedHook();
        this._fetchExpressions();
    }

    /**
     * @desc - It fetches the expressions for learning
     * @private
     */
    _fetchExpressions() {
        return this.expressionSrv.fetchExpressions()
            .then(({data: {data}}) => {
                if (data && data.length) {
                    this.$scope.currentExprs = data.map(expr => new Expression(expr));
                    this.$scope.currentExpr = this.$scope.currentExprs[0];
                }
            });
    }

    /**
     * @desc - Start speaking handler
     * @private
     */
    _handleSpeaking() {
        this._speachRecognition.start();
        this.$scope.speechRecording = true;
    }

    /**
     * @desc - Checks if the answer is correct
     * @param answer {string}
     * @private
     */
    _checkAnswer(answer) {
        this.$scope.answer = answer;
        this.$scope.currentExpr.expression.toLowerCase().trim() === answer ?
            this._handleCorrectAnswer() : this._handleIncorrectAnswer();
    }

    /**
     * @desc - Correct answer handler
     * @private
     */
    _handleCorrectAnswer() {

        this._speach.speak(this.$scope.currentExpr.expression);

        this.$timeout(() => {this.$scope.answerSuccess = true;});

        this.$scope.currentExpr.handleCorrectAnswer();

        this.$timeout(() => {
            const nextExprIndex = this._getNextExpression();

            if (nextExprIndex) {
                this._reset();
                this.$scope.currentExpr = this.$scope.currentExprs[nextExprIndex];
                return;
            }

            this._fetchExpressions()
                .then(() => this._reset());

        }, 500);

    }

    /**
     * @desc - Incorrect answer handler
     * @private
     */
    _handleIncorrectAnswer() {

        this._speach.speak(this.$scope.currentExpr.expression);

        this.$timeout(() => {this.$scope.answerWrong = true;});

        this.$scope.currentExpr.handleIncorrectAnswer();

        this.$timeout(() => this._reset(), 2000);
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
     * @desc - It resets the state
     * @private
     */
    _reset() {
        this.$scope.answer = '';
        this.$scope.answerSuccess = false;
        this.$scope.answerWrong = false;
        this.$scope.speechRecording = false;
    }

}

module.exports = LearningSpeakingController;
