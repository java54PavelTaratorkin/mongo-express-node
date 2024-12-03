import Joi from "joi";
import { ADD_ACCOUNT, ADD_UPDATE_COMMENT, DELETE_GET_COMMENT, GET_MOVIES_RATED } from "../config/pathes.mjs";
export const schemaObjectId = Joi.string().hex().length(24).required();
export const schemaCommentUpdate = Joi.object({
    commentId: schemaObjectId,
    text: Joi.string().required()
 
 });
 export const schemaAddComment = Joi.object({
    movie_id:schemaObjectId,
    email: Joi.string().email().required(),
    text: Joi.string()
 });
 export const schemaGetRatedMovies =Joi.object({
    year: Joi.number().integer(),
    genre: Joi.string().valid("Adventure", "Western", "Musical", "Short", "Family",
         "History", "Mystery", "Music", "Sport", "News", "Romance","Documentary", "War",
        "Crime","Film-Noir", "Drama", "Biography", "Thriller", "Animation", "Action",
        "Horror", "Talk-Show", "Comedy", "Fantasy"),
    acter: Joi.string(),
    amount: Joi.number().integer().positive().required() 
 });
 export const schemaAddAccount = Joi.object(
    {
        username: Joi.string().min(4).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    }
 )
 export const schemaParams = Joi.object({
    id:schemaObjectId
 })
  const schemas = {
   [ ADD_UPDATE_COMMENT]: {
        POST:schemaAddComment,
        PUT:schemaCommentUpdate
    },
    
    [GET_MOVIES_RATED]: {
        POST: schemaGetRatedMovies
    },
    [ADD_ACCOUNT]: {
        POST: schemaAddAccount
    }
    
  }
  export default schemas;