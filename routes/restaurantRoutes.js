const express = require('express');
const router = express.Router();
const Restaurant = require('../services/restaurantModel');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

/**
 * @openapi
 * /restaurants/all:
 *   get:
 *     summary: Get all restaurants (admin)
 *     tags:
 *       - Restaurants
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of all restaurants
 */
router.get('/all', authenticateToken, isAdmin, (req, res) => {
    Restaurant.all((err, restaurants) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json(restaurants);
    });
});

/**
 * @openapi
 * /restaurants/{id}:
 *   get:
 *     summary: Get a restaurant by ID (admin)
 *     tags:
 *       - Restaurants
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
 *         description: Restaurant found
 *       '404':
 *         description: Restaurant not found
 */
router.get('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    Restaurant.findById(id, (err, restaurant) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });
        res.json(restaurant);
    });
});

/**
 * @openapi
 * /restaurants/create:
 *   post:
 *     summary: Create a restaurant (admin)
 *     tags:
 *       - Restaurants
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - phone
 *               - opening_hours
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               opening_hours:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Restaurant created
 */
router.post('/create', authenticateToken, isAdmin, (req, res) => {
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

/**
 * @openapi
 * /restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant by ID (admin)
 *     tags:
 *       - Restaurants
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
 *         description: Restaurant deleted
 *       '404':
 *         description: Restaurant not found
 */
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    Restaurant.deleteById(id, (err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (changes === 0) return res.status(404).json({ error: 'Restaurant non trouvé' });
        res.json({ message: 'Restaurant supprimé' });
    });
});

/**
 * @openapi
 * /restaurants:
 *   delete:
 *     summary: Delete all restaurants (admin)
 *     tags:
 *       - Restaurants
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Number of deleted restaurants
 */
router.delete('/', authenticateToken, isAdmin, (req, res) => {
    Restaurant.deleteAll((err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json({ message: `${changes} restaurants supprimés` });
    });
});

/**
 * @openapi
 * /restaurants/{id}:
 *   put:
 *     summary: Update a restaurant (admin)
 *     tags:
 *       - Restaurants
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
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               opening_hours:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Restaurant updated
 *       '404':
 *         description: Not found
 */
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

/**
 * @openapi
 * /restaurants:
 *   get:
 *     summary: Public list of restaurants
 *     tags:
 *       - Restaurants
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: restaurant list
 */
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
