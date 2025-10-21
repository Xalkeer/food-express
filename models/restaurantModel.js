const db = require('../bin/bdd');

class Restaurant {
    static all(callback) {
        db.all('SELECT * FROM restaurants', [], callback);
    }

    static findByName(name, callback) {
        db.get('SELECT * FROM restaurants WHERE email = ?', [name], callback);
    }

    static findById(id, callback) {
        db.get('SELECT * FROM restaurants WHERE id = ?', [id], callback);
    }

    static async create({ name, address, phone, opening_hours = '08:00-22:00' }, callback) {
        try {
            const sql = 'INSERT INTO restaurants (name, address, phone, opening_hours) VALUES (?, ?, ?, ?)';
            db.run(sql, [name, address, phone, opening_hours], function (err) {
                if (err) return callback(err);
                callback(null, { id: this.lastID, name, address, phone, opening_hours});
            });
        } catch (err) {
            callback(err);
        }
    }

    static deleteById(id, callback) {
        const sql = 'DELETE FROM restaurants WHERE id = ?';
        db.run(sql, [id], function (err) {
            if (err) return callback(err);
            callback(null, this.changes);
        });
    }

    static deleteAll(callback) {
        const sql = 'DELETE FROM restaurants';
        db.run(sql, function (err) {
            if (err) return callback(err);
            callback(null, this.changes);
        });
    }

    static async update(id, { name, address, phone, opening_hours }, callback) {
        try {
            let updates = [];
            let params = [];

            if (name) { updates.push('name = ?'); params.push(name); }
            if (address) { updates.push('address = ?'); params.push(address); }
            if (phone) { updates.push('phone = ?'); params.push(phone); }
            if (opening_hours) { updates.push('opening_hours = ?'); params.push(opening_hours); }


            if (updates.length === 0) return callback(null, 0);

            const sql = `UPDATE restaurants SET ${updates.join(', ')} WHERE id = ?`;
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
        const validSorts = ['name', 'address'];
        const orderBy = validSorts.includes(sort) ? sort : 'id';

        const sql = `
        SELECT id, name, address, phone, opening_hours
        FROM restaurants
        ORDER BY ${orderBy} ASC
        LIMIT ? OFFSET ?
    `;

        db.all(sql, [parseInt(limit), parseInt(offset)], (err, rows) => {
            if (err) return callback(err);

            // On peut aussi renvoyer le total global ici si tu veux
            db.get('SELECT COUNT(*) AS total FROM restaurants', [], (countErr, countRes) => {
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

module.exports = Restaurant;
