const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Food Express API',
            version: '1.0.0',
            description: 'API documentation for Food Express'
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Local server' }
        ]
    },
    apis: ['./routes/*.js', './models/*.js'] // files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;

// --- Integration snippet for your Express app (e.g. in `app.js`) ---
/*
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const app = express();

// ... your existing middleware and routes

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// start server as usual
*/

// --- Example JSDoc for a route file `routes/menus.js` ---
/*
/**
 * @openapi
 * /menus:
 *   get:
 *     summary: Get list of menus
 *     tags:
 *       - Menus
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max number of items
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 */
