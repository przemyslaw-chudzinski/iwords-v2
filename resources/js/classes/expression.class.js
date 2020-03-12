/**
 * @desc - It's expression wrapper
 */
class Expression {
    constructor(expression) {
        this._expression = expression;
        this._used = false;
        this._usedCounter = 0;
        this._correctAnswersCounter = 0;
        this._incorrectAnswersCounter = 0;
    }

    get id() {
        return this._expression ? this._expression._id : null;
    }

    get expression() {
        return this._expression ? this._expression.expression : '';
    }

    get renderedTranslations() {
        return this._expression ? this._expression.translations.join(', ') : null;
    }

    get dikiUrl() {
        return this._expression ? `https://www.diki.pl/slownik-angielskiego?q=${this.expression}` : null;
    }

    get partOfSpeech() {
        return this._expression ? this._expression.partOfSpeech : null;
    }

    get isInRepeatState() {
        return this._expression && this._expression.repeat && this._expression.repeat.state;
    }

    get repeatCorrectAnswers() {
        return this._expression ? this._expression.repeat.correctAnswers : 0;
    }

    get repeatCountProgress() {
        return this._expression ? Math.round(+this.repeatCorrectAnswers / 10 * 100) : 0;
    }

    get used() {
        return this._used;
    }

    get hasExampleSentences() {
        return this._expression && this._expression.exampleSentences && this._expression.exampleSentences.length;
    }

    get exampleSentences() {
        return this.hasExampleSentences ? this._expression.exampleSentences : [];
    }

    get originalExpressionObject() {
        return this._expression;
    }

    markAsUsed() {
        this._used = true;
    }

    handleCorrectAnswer() {
        if (this._expression) {
            this.isInRepeatState && this._expression.repeat.correctAnswers++;
            this._used = true;
            this._usedCounter++;
            this._correctAnswersCounter++;
        }
    }

    handleIncorrectAnswer() {
        if (this._expression) {
            this.isInRepeatState && this._expression.repeat.incorrectAnswers++;
            this._used = true;
            this._usedCounter++;
            this._incorrectAnswersCounter++;
        }
    }
}

module.exports = Expression;
