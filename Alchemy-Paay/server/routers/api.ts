import express, { Router } from "express";

export function buildapiRouter(

): Router {
    const apiRouter = express.Router();

    apiRouter
        .use("/user",)  // define function in a user.ts file that defines get/ POST requests for member routes
        .use("/admin",) // define function in admin.ts to define admin authorized api calls
        .use("/tokens",) // tokens route will be used to fetch the token data for a user's address

    return apiRouter;
};
