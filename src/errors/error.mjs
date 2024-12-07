export function getError(code, text) {
    return {code, text}
}
export function errorHandler(error, req, res, next) {
    const status = error.code ?? 500;
    const text = error.text ?? "Unknown server error " + error;
    res.status(status).end(text);
     
 }