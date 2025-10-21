const express = require('express');
const router = express.Router();
const Menu = require('../models/menuModel');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

/**
 * @openapi
 * /menus/all:
 *   get:
 *     summary: Get all menus (admin)
 *     tags:
 *       - Menus
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of all menus
 */
router.get('/all', authenticateToken, isAdmin, (req, res) => {
    Menu.all((err, menus) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json(menus);
    });
});

/**
 * @openapi
 * /menus/restaurant/{restaurant_id}:
 *   get:
 *     summary: Get menus for one restaurant (public)
 *     tags:
 *       - Menus
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Menus for one restaurant
 */
router.get('/restaurant/:restaurant_id', (req, res) => {
    const { restaurant_id } = req.params;
    Menu.findByRestaurant(restaurant_id, (err, menus) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json(menus);
    });
});

/**
 * @openapi
 * /menus/{id}:
 *   get:
 *     summary: Get a menu by ID (admin)
 *     tags:
 *       - Menus
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
 *         description: Menu found
 *       '404':
 *         description: Menu not found
 */
router.get('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    Menu.findById(id, (err, menu) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (!menu) return res.status(404).json({ error: 'Menu non trouvé' });
        res.json(menu);
    });
});

/**
 * @openapi
 * /menus/create:
 *   post:
 *     summary: Create a menu (admin)
 *     tags:
 *       - Menus
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - name
 *               - price
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Menu created
 */
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

/**
 * @openapi
 * /menus/{id}:
 *   put:
 *     summary: Update a menu (admin)
 *     tags:
 *       - Menus
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
 *               restaurant_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Menu updated
 *       '404':
 *         description: Not found
 */
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const { restaurant_id, name, description, price, category } = req.body;

    Menu.update(id, { restaurant_id, name, description, price, category }, (err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (changes === 0) return res.status(404).json({ error: 'Menu non trouvé ou pas de changements' });
        res.json({ message: 'Menu mis à jour' });
    });
});

/**
 * @openapi
 * /menus/{id}:
 *   delete:
 *     summary: Delete a menu by ID (admin)
 *     tags:
 *       - Menus
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
 *         description: Menu deleted
 *       '404':
 *         description: Menu not found
 */
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    Menu.deleteById(id, (err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        if (changes === 0) return res.status(404).json({ error: 'Menu non trouvé' });
        res.json({ message: 'Menu supprimé' });
    });
});

/**
 * @openapi
 * /menus:
 *   delete:
 *     summary: Delete all menus (admin)
 *     tags:
 *       - Menus
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Number of deleted menus
 */
router.delete('/', authenticateToken, isAdmin, (req, res) => {
    Menu.deleteAll((err, changes) => {
        if (err) return res.status(500).json({ error: 'Erreur base de données' });
        res.json({ message: `${changes} menus supprimés` });
    });
});

/**
 * @openapi
 * /menus:
 *   get:
 *     summary: Public list of menus
 *     tags:
 *       - Menus
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
 *         description: Paginated menu list
 */
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
