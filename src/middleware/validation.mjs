import Joi from 'joi'
import { getError } from '../errors/error.mjs';
export  function validateBody(schemas) {
    return (req, res, next) => {
        if(req._body) {
             const schema = schemas[req.path]?.[req.method];
        if(schema) {
           req.validated = true;
           const {error} = schema.validate(req.body);
           if (error) {
             req.error_message = error.details[0]?.message;
           }
        }
        }
       
        next();
    }
    
}
export function valid(req, res, next) {
    if (req._body ) {
        if(!req.validated) {
            throw getError(500, `for ${req.method} request with body no validaton schema provided`);
        }
        if(req.error_message) {
            throw getError(400, req.error_message);
        }
        
    }
    next();

}
export function validateParams(schema) {
    return (req, res, next) => {
        const {error} = schema.validate(req.params);
        if(error) {
            throw getError(400, error.details[0].message);
        }
        next();
    }
}
