import express from 'express';
import valid from './middleware/valid.mjs';
import errorHandler from './middleware/errorHandler.mjs';
import asyncHandler from 'express-async-handler';
import MflixService from './service/MflixService.mjs';

const app = express();
const port = process.env.PORT || 3500;

const mflixService = new MflixService(
    process.env.MONGO_URI,
    process.env.DB_NAME,
    process.env.MOVIES_COLLECTION,
    process.env.COMMENTS_COLLECTION
);

const server = app.listen(port);

server.on("listening", () =>
    console.log(`server listening on port ${server.address().port}`)
);

app.use(express.json());

app.post("/mflix/comments", valid, asyncHandler(async (req, res) => {
    const commentDB = await mflixService.addComment(req.body);
    res.status(201).json(commentDB);
}));

app.put("/mflix/comments", valid, asyncHandler(async (req, res) => {
    const updatedComment = await mflixService.updateCommentText(req.body);
    res.status(200).json(updatedComment);
}));

app.delete("/mflix/comments/:id", valid, asyncHandler(async (req, res) => {
    const deletedComment = await mflixService.deleteComment(req.params.id);
    res.status(200).json(deletedComment);
}));

app.get("/mflix/comments/:id", valid, asyncHandler(async (req, res) => {
    const comment = await mflixService.getComment(req.params.id);
    res.status(200).json(comment);
}));

app.post("/mflix/movies/rated", valid, asyncHandler(async (req, res) => {
    const movies = await mflixService.getMostRatedMovies(req.body);
    res.status(200).json(movies);
}));

app.use(errorHandler);