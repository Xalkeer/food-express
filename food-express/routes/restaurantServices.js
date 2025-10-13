const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurantModel');
const { authenticateToken, isAdmin } = require('../middlewares/auth');



/* GET tous les restaurants - admin seulement */
router.get('/all', authenticateToken, isAdmin, (req, res) => {
    Restaurant.all((err, restaurants) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json(restaurants);
    });
});

/* GET un restaurant par id - admin seulement */
router.get('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    Restaurant.findById(id, (err, restaurant) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });
        res.json(restaurant);
    });
});

/* POST create restaurant - admin seulement */
router.post('/create', authenticateToken ,isAdmin,(req, res) => {
    const { name, address, phone, opening_hours } = req.body;
    if (!name || !address || !phone || !opening_hours)
        return res.status(400).json({ error: 'Champs manquants'});

    Restaurant.create({ name, address, phone, opening_hours }, (err, restaurant) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT')
                return res.status(409).json({ error: 'Addresse déjà utilisé' });
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.status(201).json({ message: 'Restaurant créé', restaurant });
    });
});

/* DELETE un restaurant par id - admin seulement */
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    Restaurant.deleteById(id, (err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (changes === 0) return res.status(404).json({ error: 'Restaurant non trouvé' });
        res.json({ message: 'Restaurant supprimé' });
    });
});

/* DELETE tous les restaurants - admin seulement */
router.delete('/', authenticateToken, isAdmin, (req, res) => {
    Restaurant.deleteAll((err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json({ message: `${changes} restaurants supprimés` });
    });
});

/* PUT update restaurant - admin seulement */
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const { name, address, phone, opening_hours } = req.body;

    Restaurant.update(id, { name, address, phone, opening_hours }, (err, changes) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT')
                return res.status(409).json({ error: 'Addresse déjà utilisé' });
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        if (changes === 0) return res.status(404).json({ error: 'Restaurant non trouvé ou pas de changements' });
        res.json({ message: 'Restaurant mis à jour' });
    });
});

/* GET liste des restaurants avec pagination et tri - public */
router.get('/', (req, res) => {
    Restaurant.getAll(req.query, (err, result) => {
        if (err) {
            console.error('Erreur SQL :', err.message);
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.json(result);
    });
});





module.exports = router;