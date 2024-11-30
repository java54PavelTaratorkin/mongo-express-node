import Joi from 'joi'
export default function validate(schema) {
    return (req, res, next) => {
        if (req.method === "PUT" ) {

            const {error} = schema.validate(req.body);
            req.validated = true;
            if(error) {
                req.error_message = error.details[0].message;
            }

        }
        next();
    }
}