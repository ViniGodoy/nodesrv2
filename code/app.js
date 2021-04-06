const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//OpenAPI configuration
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');

const passport = require('passport');
const jwt = require('./jwt');

const app = express();
const database = require('./model/db');

app.use(passport.initialize());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

passport.use('jwt', jwt.strategy.jwt);
passport.use('none', jwt.strategy.none);

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.3",
        info: {
            title: "PUCPR Server",
            version: "1.0.0",
            description: "PUCPR Server Documentation"
        },
        servers: [{
            url: "http://localhost:3000/api",
            description: "PUCPR Server"
        }]
    },
    apis: [
        __dirname + "/routes/**/*.yaml",
        __dirname + "/routes/**/*.js"
    ]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(OpenApiValidator.middleware({
    apiSpec: swaggerDocs,
    unknownFormats: [],
    operationHandlers: __dirname + '/routes'
}));

(async () => {
    try {
        const result = await database.sync();
        console.log(result);
    } catch (err) {
        console.log(err);
    }
})();
module.exports = app;
