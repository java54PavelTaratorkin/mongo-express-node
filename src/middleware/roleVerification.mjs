import { USER_REQ_NUM_LIMIT, USER_REQ_TIME_LIMIT, VALID_ROLES } from "../config/constants.mjs";
import { getError } from "../errors/error.mjs";

export function roleVerification(accountsService) {
    return  async (req, res, next) => {
        const { user: username, role } = req;
        

        if (role === VALID_ROLES.ADMIN) {
            throw getError(403, "");
        }

        if (role === VALID_ROLES.USER) {
            try {
                const currentTime = Date.now();
                const account = await accountsService.getAccount(username);

                if (!account.lastRequestTime || currentTime - account.lastRequestTime > USER_REQ_TIME_LIMIT) {                    
                    account.lastRequestTime = currentTime;
                    account.requestCount = 0;
                    
                }
        
                if (account.requestCount >= USER_REQ_NUM_LIMIT) {
                        throw getError(
                            403,
                            `Limit of ${USER_REQ_NUM_LIMIT} requests / ${Math.floor(USER_REQ_TIME_LIMIT / 1000 / 60)} minute(s) exceeded`
                        )
                }        
                account.requestCount++;
                await accountsService.updateRequestStats(username, account.lastRequestTime, account.requestCount);
            } catch (error) {
                next(error);
            } 
            
        }
        next();
    }
}