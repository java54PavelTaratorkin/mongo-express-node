import Joi from "joi";

const idParamSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
});

const commentBodySchema = Joi.object({
    movie_id: Joi.string().hex().length(24).required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    text: Joi.string().required(),
    date: Joi.date().required(),
});

const commentUpdateSchema = Joi.object({
    commentId: Joi.string().hex().length(24).required(),
    text: Joi.string().required(),
});

const ratedMoviesSchema = Joi.object({
    year: Joi.number().optional(),
    genre: Joi.string().optional(),
    actor: Joi.string().optional(),
    amount: Joi.number().required(),
});

const schemas = {
    "/mflix/comments": {
        POST: { source: "body", schema: commentBodySchema },
        PUT: { source: "body", schema: commentUpdateSchema },
    },
    "/mflix/comments/:id": {
        GET: { source: "params", schema: idParamSchema },
        DELETE: { source: "params", schema: idParamSchema },
    },
    "/mflix/movies/rated": {
        POST: { source: "body", schema: ratedMoviesSchema },
    },
};

export default schemas;