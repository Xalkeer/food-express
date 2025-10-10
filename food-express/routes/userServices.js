const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;
const { authenticateToken, isAdmin } = require('../middlewares/auth');

/* GET tous les users - admin seulement */
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
            if (err.code === 'SQLITE_CONSTRAINT')
                return res.status(409).json({ error: 'Email déjà utilisé' });
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

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Connexion réussie', token });
    });
});

/* GET profil perso */
router.get('/me', authenticateToken, (req, res) => {
    res.json({ message: 'Votre profil', user: req.user });
});

/* DELETE mon compte */
router.delete('/me', authenticateToken, (req, res) => {
    User.deleteById(req.user.id, (err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json({ message: 'Votre compte a été supprimé' });
    });
});

/* DELETE un user (admin) */
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    const userId = parseInt(req.params.id, 10);
    User.deleteById(userId, (err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json({ message: 'Utilisateur supprimé' });
    });
});

/* DELETE tous les users (admin) */
router.delete('/', authenticateToken, isAdmin, (req, res) => {
    User.deleteAll((err) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json({ message: 'Tous les utilisateurs ont été supprimés' });
    });
});

/* PUT update me */
router.put('/me', authenticateToken, (req, res) => {
    User.update(req.user.id, req.body, (err, changes) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT')
                return res.status(409).json({ error: 'Email déjà utilisé' });
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        if (changes === 0)
            return res.status(404).json({ error: 'Utilisateur non trouvé' });

        // Recrée un token mis à jour
        const token = jwt.sign(
            { id: req.user.id, name: req.body.name || req.user.name, email: req.body.email || req.user.email, role: req.user.role },
            SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Modification réussie', newtoken: token });
    });
});

/* PUT update un user (admin) */
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
