const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;
const { authenticateToken, isAdmin } = require('../middlewares/auth');


/* GET tous les users - Protégé, admin seulement */
router.get('/', authenticateToken, isAdmin, (req, res) => {
    User.all((err, users) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json(users);
    });
});

/* POST register */
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'Champs manquants' });

    User.create({ name, email, password }, (err, user) => {
        if (err) {
            console.error('Erreur lors de la création du user :', err);
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Email déjà utilisé' });
            }
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.status(201).json({ message: 'Utilisateur créé', user });
    });
});

/* POST login */
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email et mot de passe requis' });

    User.verifyPassword(email, password, (err, user) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: '1h' });

        res.json({ message: 'Connexion réussie', token: token });
    });
});

/* GET info personnel - Protégé */
router.get('/me', authenticateToken, (req, res) => {
    res.json({ message: 'Votre profil', user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role }});
});

/* DELETE me - Protégé */
router.delete('/me', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = 'DELETE FROM users WHERE id = ?';
    const db = require('../bin/bdd');
    db.run(sql, [userId], function(err) {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (this.changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json({ message: 'Votre compte a été supprimé' });
    });
});

/* DELETE un user par id - Protégé, admin seulement */
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const sql = 'DELETE FROM users WHERE id = ?';
    const db = require('../bin/bdd');
    db.run(sql, [userId], function(err) {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (this.changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json({ message: 'Utilisateur supprimé' });
    });
});

/* DELETE tous les users - Protégé, admin seulement */
router.delete('/', authenticateToken, isAdmin, (req, res) => {
    const sql = 'DELETE FROM users';
    const db = require('../bin/bdd');
    db.run(sql, function(err) {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json({ message: 'Tous les utilisateurs ont été supprimés' });
    });
});

/* PUT update me - Protégé */
router.put('/me', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { name, email, password } = req.body;

    User.findById(userId, async (err, user) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        const updatedName = name || user.name;
        const updatedEmail = email || user.email;
        let updatedPassword = user.password;

        if (password) {
            try {
                updatedPassword = await require('bcrypt').hash(password, 10);
            } catch (hashErr) {
                return res.status(500).json({ error: 'Erreur lors du hachage du mot de passe' });
            }
        }

        const sql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
        const db = require('../bin/bdd');
        db.run(sql, [updatedName, updatedEmail, updatedPassword, userId], function(err) {
            if (err) {
                console.error('Erreur lors de la mise à jour du user :', err);
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: 'Email déjà utilisé' });
                }
                return res.status(500).json({ error: 'Erreur base de données' });
            }
            const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: '1h' });

            res.json({ message: 'Modification reussi', newtoken: token });
        });
    });
});

/* PUT update un user par id - Protégé, admin seulement */
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const { name, email, password, role } = req.body;

    User.findById(userId, async (err, user) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        const updatedName = name || user.name;
        const updatedEmail = email || user.email;
        const updatedRole = role || user.role;
        let updatedPassword = user.password;

        if (password) {
            try {
                updatedPassword = await require('bcrypt').hash(password, 10);
            } catch (hashErr) {
                return res.status(500).json({ error: 'Erreur lors du hachage du mot de passe' });
            }
        }

        const sql = 'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?';
        const db = require('../bin/bdd');
        db.run(sql, [updatedName, updatedEmail, updatedPassword, updatedRole, userId], function(err) {
            if (err) {
                console.error('Erreur lors de la mise à jour du user :', err);
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: 'Email déjà utilisé' });
                }
                return res.status(500).json({ error: 'Erreur base de données' });
            }
            res.json({ message: 'Utilisateur modifié' });
        });
    });
});


module.exports = router;
