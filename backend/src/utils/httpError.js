export class HttpError extends Error {
  constructor(statusCode, message, details, code) {
    super(message);
    // statusCode becomes the HTTP response status.
    this.statusCode = statusCode;
    // details can carry extra safe information for the frontend.
    this.details = details;
    // code is an optional stable error code.
    this.code = code;
  }
}
