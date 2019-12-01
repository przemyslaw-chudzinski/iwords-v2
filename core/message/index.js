const severity = {
  error: 'error',
  warning: 'warning',
  success: 'success',
  info: 'info'
};

class Message {
    constructor(message, severity = severity.info) {
        this.message = message;
        this.severity = severity;
    }
}

class WrongLoginCredentialsMessage extends Message {
    constructor() {
        super('Błędne dane logowania', severity.error);
    }
}

class InternalServerErrorMessage extends Message {
    constructor() {
        super('Wystąpił nieoczekiwany błąd serwera', severity.error);
    }
}

class WrongApiKeyMessage extends Message {
    constructor(message) {
        if (!message) {
            message = 'Api key jest nie poprawny, lub nie został wprowadzony poprawnie';
        }
        super(message, severity.error);
    }
}

module.exports = {
    severity,
    Message,
    WrongLoginCredentialsMessage,
    InternalServerErrorMessage,
    WrongApiKeyMessage
};
