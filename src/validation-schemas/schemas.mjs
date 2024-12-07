import Joi from "joi";
import { ADD_UPDATE_ACCOUNT, ADD_UPDATE_COMMENT, GET_MOVIES_RATED } from "../config/pathes.mjs";
 const schemaObjectId = Joi.string().hex().length(24).required();
 const schemaCommentUpdate = Joi.object({
    commentId: schemaObjectId,
    text: Joi.string().required()
 
 });
  const schemaAddComment = Joi.object({
    movie_id:schemaObjectId,
    email: Joi.string().email().required(),
    text: Joi.string()
 });
  const schemaGetRatedMovies =Joi.object({
    year: Joi.number().integer(),
    genre: Joi.string().valid("Adventure", "Western", "Musical", "Short", "Family",
         "History", "Mystery", "Music", "Sport", "News", "Romance","Documentary", "War",
        "Crime","Film-Noir", "Drama", "Biography", "Thriller", "Animation", "Action",
        "Horror", "Talk-Show", "Comedy", "Fantasy"),
    acter: Joi.string(),
    amount: Joi.number().integer().positive().required() 
 });
 const schemaAddAccount = Joi.object(
    {
        username: Joi.string().min(4).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    }
 )
 export const schemaParams = Joi.object({
    id:schemaObjectId
 })
 const schemaUpdatePassword = Joi.object({
    username: Joi.string().min(4).required(),
    newPassword: Joi.string().min(8).required()
 });
  const schemas = {
   [ ADD_UPDATE_COMMENT]: {
        POST:schemaAddComment,
        PUT:schemaCommentUpdate
    },
    
    [GET_MOVIES_RATED]: {
        POST: schemaGetRatedMovies
    },
    [ADD_UPDATE_ACCOUNT]: {
        POST: schemaAddAccount,
        PUT: schemaUpdatePassword
    },

    
  }
  export default schemas;