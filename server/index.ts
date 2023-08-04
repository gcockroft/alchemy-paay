import express from "express";
import path from "path";
import { buildapiRouter } from "./routers/api";


async function main(): Promise<void> {
    const app = express();
    app
        .use(express.json())
        .use("/api", buildapiRouter());


}




main();