const express = require('express');
const router = express.Router();
const User = require('../services/userModel');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;
const { authenticateToken, isAdmin } = require('../middlewares/auth');

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users (admin)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of users
 */
router.get('/', authenticateToken, isAdmin, (req, res) => {
    User.all((err, users) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json(users);
    });
});

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User created
 *       '409':
 *         description: Email already used
 */
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'Champs manquants' });

    User.create({ name, email, password }, (err, user) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT')
                return res.status(409).json({ error: 'Email déjà utilisé' });
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.status(201).json({ message: 'Utilisateur créé', user });
    });
});

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful, returns token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       '401':
 *         description: Invalid credentials
 */
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email et mot de passe requis' });

    User.verifyPassword(email, password, (err, user) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Connexion réussie', token });
    });
});

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user profile
 */
router.get('/me', authenticateToken, (req, res) => {
    res.json({ message: 'Votre profil', user: req.user });
});

/**
 * @openapi
 * /users/me:
 *   delete:
 *     summary: Delete current user's account
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Account deleted
 *       '404':
 *         description: User not found
 */
router.delete('/me', authenticateToken, (req, res) => {
    User.deleteById(req.user.id, (err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json({ message: 'Votre compte a été supprimé' });
    });
});

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID (admin)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: User deleted
 *       '404':
 *         description: User not found
 */
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    const userId = parseInt(req.params.id, 10);
    User.deleteById(userId, (err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json({ message: 'Utilisateur supprimé' });
    });
});

/**
 * @openapi
 * /users:
 *   delete:
 *     summary: Delete all users (admin)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: All users deleted
 */
router.delete('/', authenticateToken, isAdmin, (req, res) => {
    User.deleteAll((err) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json({ message: 'Tous les utilisateurs ont été supprimés' });
    });
});

/**
 * @openapi
 * /users/me:
 *   put:
 *     summary: Update current user's profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Profile updated and new token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newtoken:
 *                   type: string
 *       '404':
 *         description: User not found
 */
router.put('/me', authenticateToken, (req, res) => {
    User.update(req.user.id, req.body, (err, changes) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT')
                return res.status(409).json({ error: 'Email déjà utilisé' });
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        if (changes === 0)
            return res.status(404).json({ error: 'Utilisateur non trouvé' });

        // Recreate updated token
        const token = jwt.sign(
            { id: req.user.id, name: req.body.name || req.user.name, email: req.body.email || req.user.email, role: req.user.role },
            SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Modification réussie', newtoken: token });
    });
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID (admin)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User updated
 *       '404':
 *         description: User not found
 */
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
    const userId = parseInt(req.params.id, 10);

    User.update(userId, req.body, (err, changes) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT')
                return res.status(409).json({ error: 'Email déjà utilisé' });
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        if (changes === 0){
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({ message: 'Utilisateur modifié' });
    });
});

module.exports = router;
