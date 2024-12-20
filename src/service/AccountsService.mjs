import { VALID_ROLES } from "../config/constants.mjs";
import { getError } from "../errors/error.mjs";
import MongoConnection from "../mongo/MongoConnection.mjs";
import bcrypt from "bcrypt";

export default class AccountsService {
    #accounts;
    #connection;

    constructor(connection_str, db_name) {
        this.#connection = new MongoConnection(connection_str, db_name);
        this.#accounts = this.#connection.getCollection("accounts");
    }

    async insertAccount(account) {
        const accountDB = await this.#accounts.findOne({ _id: account.username });
        if (accountDB) {
            throw getError(400, `Account for ${account.username} already exists`);
        }
        const toInsertAccount = this.#toAccountDB(account);
        const result = await this.#accounts.insertOne(toInsertAccount);
        if (result.insertedId === account.username) {
            return toInsertAccount;
        }
    }

    async updatePassword({ username, newPassword }) {
        const accountUpdated = await this.#accounts.findOneAndUpdate(
            { _id: username },
            { $set: { hashPassword: bcrypt.hashSync(newPassword, 10) } },
            { returnDocument: "after" }
        );
        this.#ensureAccountUpdated(accountUpdated, username);
        return accountUpdated;
    }

    async getAccount(username) {
        const account = await this.#accounts.findOne({ _id: username });
        this.#ensureAccountUpdated(account, username);
        return account;
    }

    async deleteAccount(username) {
        const account = await this.getAccount(username);
        await this.#accounts.deleteOne({ _id: username });
        return account;
    }

    async setRole({ username, role }) {
        const accountUpdated = await this.#accounts.findOneAndUpdate(
            { _id: username },
            { $set: { role } },
            { returnDocument: "after" }
        );
        this.#ensureAccountUpdated(accountUpdated, username);
        return accountUpdated;
    }

    async updateRequestStats(username, lastRequestTime, requestCount) {
        const accountUpdated = await this.#accounts.findOneAndUpdate(
            { _id: username },
            { $set: { lastRequestTime, requestCount } },
            { returnDocument: "after" }
        );
        this.#ensureAccountUpdated(accountUpdated, username);
        return accountUpdated;
    }

    #ensureAccountUpdated(account, username) {
        if (!account) {
            throw getError(404, `Account ${username} not found`);
        }
    }

    #toAccountDB(account) {
        return {
            _id: account.username,
            email: account.email,
            hashPassword: bcrypt.hashSync(account.password, 10),
            role: VALID_ROLES.USER,
        };
    }
}