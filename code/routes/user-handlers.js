const express = require('express');
const router = express.Router();
const User = require('../model/User');
const jwt = require('../jwt');
const passport = require('passport');

router.post('/', async function(req, res, next) {
    if (!req.body || !req.body.name) {
        return res.sendStatus(400);
    }

    const user = await User.create({
        name: req.body.name
    });
    return res.status(201).json(user);
});

/**
 * @openapi
 *
 *  /users/{id}:
 *   get:
 *     summary: "Lista um usuário do sistema"
 *     tags:
 *       - "users"
 *
 *     operationId: users_get
 *     x-eov-operation-handler: user-handlers
 *
 *     responses:
 *       '200':
 *         description: "Retorna a lista de usuários"
 */
module.exports.users_get = async function(req, res) {
    const {params: {id}} = req;

    const user = await User.findByPk(id);
    if (!user) {
        return res.sendStatus(404);
    }

    return res.json({
        ...user.get(),
        token: jwt.createToken(user)
    });
};


/**
 * @openapi
 *
 *  /users:
 *   get:
 *     summary: "Lista todos os usuários do sistema"
 *     tags:
 *       - "users"
 *
 *     operationId: users_list
 *     x-eov-operation-handler: user-handlers
 *
 *     responses:
 *       '200':
 *         description: "Retorna a lista de usuários"
 *       '404':
 *         description: "Usuário não encontrado"
 *
 *     security:
 *       - JWT: []
 *       - {}
 */
module.exports.users_list = [
    passport.authenticate(['jwt', 'none'], {session: false}),
    async function(req, res) {
        const id = req.user?.id;

        let users = await User.findAll({
            order: [['name', 'ASC']]
        });
        users = users.map(u => ({
            ...u.get(),
            self: Boolean(id === u.id)
        }));

        return res.json(users);
    }
]

/**
 * @openapi
 *
 *  /users/me:
 *   patch:
 *     summary: "Atualiza o usuário passado por parâmetro"
 *     tags:
 *       - "users"
 *
 *     operationId: users_update
 *     x-eov-operation-handler: user-handlers
 *
 *     requestBody:
 *       description: "User data to update"
 *       content:
 *          "application/json":
 *            schema:
 *               type: object
 *               required:
 *                 - name
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Fulano de Tal"
 *
 *
 *     responses:
 *       '200':
 *         description: "Usuário atualizado"
 *       '400':
 *         description: "Parâmetro inválido"
 *       '404':
 *         description: "Usuário não encontrado"
 *
 *     security:
 *       - JWT: []
 */
module.exports.users_update = [
    passport.authenticate('jwt', {session: false}),
    async function(req, res) {
        const {body: {name}} = req;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.sendStatus(404);
        }
        user.name = name;
        res.json(await user.save());
    }
]

router.delete('/:id', async function(req, res, next) {
    if (!req.params.id) {
        return res.sendStatus(400);
    }

    const {params: {id}} = req;

    const user = await User.findByPk(id);
    if (!user) {
        return res.sendStatus(404);
    }
    await user.destroy();
    res.sendStatus(200);
});