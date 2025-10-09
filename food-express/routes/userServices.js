const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

/* GET tous les users */
router.get('/', (req, res) => {
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

        res.json({ message: 'Connexion réussie', user: { id: user.id, name: user.name, email: user.email } });
    });
});

module.exports = router;
