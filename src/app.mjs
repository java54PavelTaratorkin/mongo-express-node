import express from 'express';
import { mflix_route } from './routes/mflix.mjs';
import {validateBody, valid, validateParams} from './middleware/validation.mjs'
import { accounts_route } from './routes/accounts.mjs';
import { errorHandler } from './errors/error.mjs';
import schemas  from './validation-schemas/schemas.mjs';
import AccountsService from './service/AccountsService.mjs';
import { authenticate, auth } from './middleware/authentication.mjs';
import { ADD_UPDATE_ACCOUNT } from './config/pathes.mjs';
import { roleVerification } from './middleware/roleVerification.mjs';

const app = express();
const port = process.env.PORT || 3500;
export const accountsService = new AccountsService(process.env.MONGO_URI, process.env.DB_NAME);
const server = app.listen(port);


server.on("listening", ()=>console.log(`server listening on port ${server.address().port}`));
app.use(express.json());
app.use(authenticate(accountsService));
app.use(auth(JSON.stringify({path:ADD_UPDATE_ACCOUNT, method:"POST"})))
app.use(validateBody(schemas));
app.use(valid);
app.use('/mflix', roleVerification(),mflix_route);
app.use('/accounts', accounts_route);
app.use(errorHandler);