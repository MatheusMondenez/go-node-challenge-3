const express = require("express");
const mongoose = require("mongoose");
const Youch = require("youch");
const validate = require("express-validation");
const dbConfig = require("./config/database");
const routes = require("./routes");

class App {
    constructor() {
        this.express = express();
        this.isDev = process.env.NODE_ENV !== "production";

        this.middlewares();
        this.database();
        this.routes();
        this.exception();
    }

    middlewares() {
        this.express.use(express.json());
    }

    database() {
        mongoose.connect(
            dbConfig.uri,
            {
                useCreateIndex: true,
                useNewUrlParser: true
            }
        );
    }

    routes() {
        this.express.use(routes);
    }

    exception() {
        this.express.use(async (err, req, res, next) => {
            if (err instanceof validate.ValidationError) {
                return res.status(err.status).json(err);
            }

            if (process.env.NODE_ENV !== "production") {
                const youch = new Youch(err, req); // Não precisa do req se for JSON, só HTML

                return res.json(await youch.toJSON());
            }

            return res
                .status(err.status || 500)
                .json({ error: "Internal server error" });
        });
    }
}

module.exports = new App().express;
