import { USER_REQ_NUM_LIMIT, USER_REQ_TIME_LIMIT, VALID_ROLES } from "../config/constants.mjs";
import { getError } from "../errors/error.mjs";

const userRequestTracker = {};

export function roleVerification() {
    return (req, res, next) => {
        const { user: username, role } = req;

        if (role === VALID_ROLES.ADMIN) {
            throw getError(403, "");
        }

        if (role === VALID_ROLES.USER) {
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