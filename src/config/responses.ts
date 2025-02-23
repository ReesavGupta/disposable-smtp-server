export const RESPONSES = {
    WELCOME: '220 Welcome to Disposable SMTP Server\r\n',
    HELLO: '250 Hello\r\n',
    OK: '250 OK\r\n',
    DATA_START: '354 Start mail input; end with <CRLF>.<CRLF>\r\n',
    MESSAGE_ACCEPTED: '250 Message accepted\r\n',
    INVALID_EMAIL: '550 Invalid email address\r\n',
    USER_NOT_FOUND: '550 User not found\r\n',
    SYSTEM_ERROR: '451 Requested action aborted: local error in processing\r\n',
    TIMEOUT: '421 Service not available, closing transmission channel\r\n',
    BAD_SEQUENCE: '503 Bad sequence of commands\r\n',
    GOODBYE: '221 Goodbye\r\n',
    UNKNOWN_COMMAND: '500 Unrecognized command\r\n',
}
