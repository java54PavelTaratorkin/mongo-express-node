import bcrypt from 'bcrypt'
import { getError } from '../errors/error.mjs';
import { BASIC_AUTH, VALID_ROLES } from '../config/constants.mjs';

export function authenticate(accountingService) {
    return async (req, res, next) => {
        const authHeader = req.header("Authorization")
        if (authHeader) {
            if(authHeader.startsWith(BASIC_AUTH)) {
                await basicAuth(authHeader, req, accountingService)
            }
        }
        next();
    }
}
export function auth(...skipRoutes) {
   return (req, res, next) => {
    if(!skipRoutes.includes(JSON.stringify({path:req.path, method: req.method})) ) {
        if (!req.user) {
            throw getError(401, "");
        }

    }
    next();
   }
}
export async function basicAuth(authHeader, req, accountingService) {
    const userPasswordBase64 = authHeader.substring(BASIC_AUTH.length);
    const userPasswordAscii = Buffer.from(userPasswordBase64, 'base64').toString("ascii");
    const [username, password] = userPasswordAscii.split(":");    

    try { 
        const account = await accountingService.getAccount(username);
      
        if (account && await bcrypt.compare(password, account.hashPassword)) {
            req.user = account._id;
            req.role = account.role || VALID_ROLES.USER;
        }
        
    } catch (error) {
        
    }
    
}