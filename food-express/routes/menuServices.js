const express = require('express');
const router = express.Router();
const Menu = require('../models/menuModel');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

/* GET tous les menus - admin seulement */
router.get('/all', authenticateToken, isAdmin, (req, res) => {
    Menu.all((err, menus) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json(menus);
    });
});

/* GET un menu par ID - admin seulement */
router.get('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    Menu.findById(id, (err, menu) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (!menu) return res.status(404).json({ error: 'Menu non trouvé' });
        res.json(menu);
    });
});

/* GET les menus d’un restaurant spécifique - public */
router.get('/restaurant/:restaurant_id', (req, res) => {
    const { restaurant_id } = req.params;
    Menu.findByRestaurant(restaurant_id, (err, menus) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json(menus);
    });
});

/* POST créer un menu - admin seulement */
router.post('/create', authenticateToken, isAdmin, (req, res) => {
    const { restaurant_id, name, description, price, category } = req.body;

    if (!restaurant_id || !name || !price)
        return res.status(400).json({ error: 'Champs manquants' });

    Menu.create({ restaurant_id, name, description, price, category }, (err, menu) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT')
                return res.status(409).json({ error: 'Conflit de contrainte (restaurant_id invalide ?)' });
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.status(201).json({ message: 'Menu créé', menu });
    });
});

/* PUT modifier un menu - admin seulement */
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const { restaurant_id, name, description, price, category } = req.body;

    Menu.update(id, { restaurant_id, name, description, price, category }, (err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (changes === 0) return res.status(404).json({ error: 'Menu non trouvé ou pas de changements' });
        res.json({ message: 'Menu mis à jour' });
    });
});

/* DELETE un menu par ID - admin seulement */
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    Menu.deleteById(id, (err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (changes === 0) return res.status(404).json({ error: 'Menu non trouvé' });
        res.json({ message: 'Menu supprimé' });
    });
});

/* DELETE tous les menus - admin seulement */
router.delete('/', authenticateToken, isAdmin, (req, res) => {
    Menu.deleteAll((err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json({ message: `${changes} menus supprimés` });
    });
});

/* GET liste publique des menus avec pagination et tri */
router.get('/', (req, res) => {
    Menu.getAll(req.query, (err, result) => {
        if (err) {
            console.error('Erreur SQL :', err.message);
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.json(result);
    });
});

module.exports = router;
