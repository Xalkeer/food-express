// javascript
// File: `routes/users.js`
var express = require('express');
var router = express.Router();
var db = require('../bin/bdd');

/* GET users listing. */
router.get('/', function(req, res, next) {
    db.all('SELECT id, name, email FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json(rows);
    });
});

/* POST ajout d'un user */
router.post('/register', function(req, res, next) {
    const user = req.body;
    if (!user || !user.name || !user.email || !user.password) {
        return res.status(400).send('Le user doit avoir un nom et un email et un mot de passe');
    }

    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const params = [user.name, user.email, user.password];

    db.run(sql, params, function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            return res.status(500).json({ error: 'DB error' });
        }
        const created = { id: this.lastID, name: user.name, email: user.email };
        res.status(201).json({ message: 'User ajouté avec succès', user: created });
    });
});

module.exports = router;