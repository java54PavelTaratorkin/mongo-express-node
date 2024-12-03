import { getError } from "../errors/error.mjs";
import MongoConnection from "../mongo/MongoConnection.mjs"
import bcrypt from 'bcrypt';
export default class AccountsService {
    #accounts
    #connection
    constructor(connection_str, db_name) {
        this.#connection = new MongoConnection(connection_str, db_name);
        this.#accounts = this.#connection.getCollection('accounts');
    }
    async insertAccount(account) {
        const accountDB = await this.#accounts.findOne({_id:account.username});
        if(accountDB) {
            throw getError(400, `account for ${account.username} already exists`);
        }
        const toInsertAccount = this.#toAccountDB(account);
        const result = await this.#accounts.insertOne(toInsertAccount);
        if (result.insertedId == account.username) {
            return toInsertAccount;
        }

    }
    #toAccountDB(account) {
        const accountDB = {};
        accountDB._id = account.username;
        accountDB.email = account.email;
        accountDB.hashPassword = bcrypt.hashSync(account.password, 10);
        return accountDB;
    }
}