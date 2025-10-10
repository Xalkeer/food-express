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

/* PUT update user - Protégé, admin ou soi-même */
router.put('/:id', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès interdit' });
    }

    const { name, email, password } = req.body;
    User.findById(userId, (err, user) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        const updatedUser = {
            name: name || user.name,
            email: email || user.email,
            password: password || user.password
        };

        User.create(updatedUser, (err, newUser) => {
            if (err) return res.status(500).json({ error: 'Erreur base de données' });
            res.json({ message: 'Utilisateur mis à jour', user: newUser });
        });
    });
});

/* DELETE user - Protégé, admin ou soi-même */
router.delete('/:id', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès interdit' });
    }

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        const sql = 'DELETE FROM users WHERE id = ?';
        const db = require('../bin/bdd');
        db.run(sql, [userId], function(err) {
            if (err) return res.status(500).json({ error: 'Erreur base de données' });
            res.json({ message: 'Utilisateur supprimé' });
        });
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


module.exports = router;
