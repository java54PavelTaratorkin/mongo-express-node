export default function errorHandler(error, req, res, next) {
    const status = error.code || 500;
    const text = error.text || "Unknown server error";
    res.status(status).json({ error: text });
}