import schemas from "../config/validationSchemas.mjs";
import { getError } from "../errors/errors.mjs";

export default function valid(req, res, next) {
    const path = req.route.path;
    const method = req.method;
    const schemaEntry = schemas[path][method];    
    const { source, schema } = schemaEntry;
    const { error } = schema.validate(req[source]);

    if (error) {
        throw getError(400, error.details[0].message);
    }

    next();
}
