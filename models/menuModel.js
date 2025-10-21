const db = require('../bin/bdd');

class Menu {
    static all(callback) {
        db.all('SELECT * FROM menus', [], callback);
    }

    static findById(id, callback) {
        db.get('SELECT * FROM menus WHERE id = ?', [id], callback);
    }

    static findByRestaurant(restaurant_id, callback) {
        db.all('SELECT * FROM menus WHERE restaurant_id = ?', [restaurant_id], callback);
    }

    static async create({ restaurant_id, name, description = '', price, category = '' }, callback) {
        try {
            const sql = `
                INSERT INTO menus (restaurant_id, name, description, price, category)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.run(sql, [restaurant_id, name, description, price, category], function (err) {
                if (err) return callback(err);
                callback(null, {
                    id: this.lastID,
                    restaurant_id,
                    name,
                    description,
                    price,
                    category
                });
            });
        } catch (err) {
            callback(err);
        }
    }

    static deleteById(id, callback) {
        const sql = 'DELETE FROM menus WHERE id = ?';
        db.run(sql, [id], function (err) {
            if (err) return callback(err);
            callback(null, this.changes);
        });
    }

    static deleteAll(callback) {
        const sql = 'DELETE FROM menus';
        db.run(sql, function (err) {
            if (err) return callback(err);
            callback(null, this.changes);
        });
    }

    static async update(id, { restaurant_id, name, description, price, category }, callback) {
        try {
            let updates = [];
            let params = [];

            if (restaurant_id) { updates.push('restaurant_id = ?'); params.push(restaurant_id); }
            if (name) { updates.push('name = ?'); params.push(name); }
            if (description) { updates.push('description = ?'); params.push(description); }
            if (price) { updates.push('price = ?'); params.push(price); }
            if (category) { updates.push('category = ?'); params.push(category); }

            if (updates.length === 0) return callback(null, 0);

            const sql = `UPDATE menus SET ${updates.join(', ')} WHERE id = ?`;
            params.push(id);

            db.run(sql, params, function (err) {
                if (err) return callback(err);
                callback(null, this.changes);
            });
        } catch (err) {
            callback(err);
        }
    }

    static getAll({ sort, limit = 10, offset = 0 }, callback) {
        const validSorts = ['name', 'price', 'category'];
        const orderBy = validSorts.includes(sort) ? sort : 'id';

        const sql = `
            SELECT id, restaurant_id, name, description, price, category
            FROM menus
            ORDER BY ${orderBy} ASC
            LIMIT ? OFFSET ?
        `;

        db.all(sql, [parseInt(limit), parseInt(offset)], (err, rows) => {
            if (err) return callback(err);

            db.get('SELECT COUNT(*) AS total FROM menus', [], (countErr, countRes) => {
                if (countErr) return callback(countErr);

                callback(null, {
                    total: countRes.total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    data: rows
                });
            });
        });
    }
}

module.exports = Menu;
