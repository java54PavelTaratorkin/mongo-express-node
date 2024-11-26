import express from 'express';
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

app.post("/mflix/comments", async (req, res) => {
    // Add a new comment
    const commentDB = await mflixService.addComment(req.body);
    res.status(201).end(JSON.stringify(commentDB));
});

app.put("/mflix/comments", async (req, res) => {
    // Update comment
    // req.body {"commentId":<string>, "text":<string>}
    const modifiedCommentCount = await mflixService.updateComment(req.body);
    res.status(200).end(JSON.stringify({modifiedCommentCount: modifiedCommentCount}));
});

app.delete("/mflix/comments/:id", async (req, res) => {
    // Delete comment
    // req.params.id - comment to delete
    const deletedCommentCount = await mflixService.deleteComment(req.params.id);
    res.status(200).end(JSON.stringify({deletedCommentCount: deletedCommentCount}));
});

app.get("/mflix/comments/:id", async (req, res) => {
    //TODO get comment
   // req.params.id - comment to get
    const comment = await mflixService.getCommentsByMovie(req.params.id);
    res.status(200).end(JSON.stringify(comment));
});

app.post("/mflix/movies/rated", async (req, res) => {
    // Find most IMDb-rated movies
    // req.body {"year":<number>(optional), "genre":<string>(optional),
    // "actor":<string-regex>(optional), "amount":<number>(mandatory)}
    // no year = all years, no genre = all genres, no actor = all actors
    const movies = await mflixService.findMostRatedMovies(req.body);
    res.status(200).end(JSON.stringify(movies));
});