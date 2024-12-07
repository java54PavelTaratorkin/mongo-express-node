import express from 'express';
export const accounts_route = express.Router();
import asyncHandler from 'express-async-handler';
import { ACCOUNTS_ACCOUNT, DELETE_GET_ACCOUNT } from '../config/pathes.mjs';
import { accountsService } from '../app.mjs';
import { getError } from '../errors/error.mjs';
accounts_route.post(ACCOUNTS_ACCOUNT, asyncHandler(async (req, res) => {
    const account = await accountsService.insertAccount(req.body);
    res.status(201).json(account);
}));
accounts_route.put(ACCOUNTS_ACCOUNT, asyncHandler(async (req, res) => {
    if(req.user != req.body.username) {
        throw getError(403, "");
    }
   const account = await accountsService.updatePassword(req.body);
   res.status(200).json(account);
}));
accounts_route.get(DELETE_GET_ACCOUNT, asyncHandler(async (req, res) => {
    if(req.user != req.body.username && req.role != "ADMIN") {
        throw getError(403, "");
    }
    const account = await accountsService.getAccount(req.params.username);
   res.status(200).json(account);
}))
accounts_route.delete(DELETE_GET_ACCOUNT, asyncHandler(async (req, res) => {
    const account = await accountsService.deleteAccount(req.params.username);
   res.status(200).json(account);
}))