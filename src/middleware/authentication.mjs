import bcrypt from 'bcrypt'
import { getError } from '../errors/error.mjs';
import { BASIC_AUTH, SET_ROLE_PASSWORD, SET_ROLE_USERNAME, USER_REQ_NUM_LIMIT, USER_REQ_TIME_LIMIT, VALID_ROLES } from '../config/constants.mjs';
const userRequestTracker = {};

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

    if (username === SET_ROLE_USERNAME && password === SET_ROLE_PASSWORD) {
        req.user = username;
        req.role = VALID_ROLES.ADMIN;
    } else {
        try {
            const account = await accountingService.getAccount(username);
            if (account && await bcrypt.compare(password, account.hashPassword)) {
                req.user = account._id;
                req.role = account.role || VALID_ROLES.USER;
            }
        } catch (error) {
            
        }
    }
}

export function roleVerification() {
    return (req, res, next) => {
        const { user: username, role } = req;

        if (role === VALID_ROLES.ADMIN) {
            throw getError(403, "");
        } else if (role === VALID_ROLES.USER) {
            checkReqAccessLimit(username);
        }
        next();
    };


}

function checkReqAccessLimit(username) {
    const currentTime = Date.now();
    const userData = userRequestTracker[username] || { count: 0, lastRequestTime: currentTime };

    if (currentTime - userData.lastRequestTime > USER_REQ_TIME_LIMIT) {
        userRequestTracker[username] = { count: 1, lastRequestTime: currentTime };
    } else {
        userData.count += 1;
        if (userData.count > USER_REQ_NUM_LIMIT) {
            throw getError(403, `Limit of ${USER_REQ_NUM_LIMIT} requests / ${Math.floor(USER_REQ_TIME_LIMIT / 1000 / 60)} minute(s) exceeded`);
        }
        userRequestTracker[username] = userData;
    }
}