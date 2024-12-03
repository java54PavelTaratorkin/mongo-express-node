import express from 'express';
import asyncHandler from 'express-async-handler';
import MflixService from '../service/MflixService.mjs';
import { validateParams } from '../middleware/validation.mjs';
import { schemaParams } from '../validation-schemas/schemas.mjs';
export const mflix_route = express.Router();

const mflixService = new MflixService(process.env.MONGO_URI, process.env.DB_NAME,
    process.env.MOVIES_COLLECTION, process.env.COMMENTS_COLLECTION)
mflix_route.post('/comments', asyncHandler(async (req, res) => {
    const commentDB = await mflixService.addComment(req.body);
    res.status(201).end(JSON.stringify(commentDB));
}));
mflix_route.put('/comments', asyncHandler(async (req, res) => {
    //update comment
    //req.body {"commentId":<string>, "text":<string>}
   
    if(req.error_message) {
        throw {code:400, text: req.error_message}
    }
    const commentUpdated = await mflixService.updateCommentText(req.body);
    res.status(200).end(JSON.stringify(commentUpdated));
}));
mflix_route.delete('/comments/:id', validateParams(schemaParams), asyncHandler(async (req, res) => {
    // delete comment
   // req.params.id - comment to delete
   const deletedComment = await mflixService.deleteComment(req.params.id);
   res.status(200).end(JSON.stringify(deletedComment));
}))
mflix_route.get('/comments/:id',  validateParams(schemaParams), asyncHandler(async (req, res) => {
    //get comment
   // req.params.id - comment to get
   const comment = await mflixService.getComment(req.params.id);
   res.status(200).end(JSON.stringify(comment));
}))
mflix_route.post('/movies/rated', asyncHandler(async (req, res) => {
    //find most imdb rated movies
   // req.body {"year":<number>(optional), "genre":<string>(optional),
   // "acter":<string-regex>(optional), "amount":<number>(mandatary)}
   const movies = await mflixService.getMostRatedMovies(req.body);
   res.status(200).end(JSON.stringify(movies));
}))