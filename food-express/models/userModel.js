const db = require('../bin/bdd');
const bcrypt = require('bcrypt');

class User {
    static all(callback) {
        db.all('SELECT id, name, email, role FROM users', [], callback);
    }

    static findByEmail(email, callback) {
        db.get('SELECT * FROM users WHERE email = ?', [email], callback);
    }

    static findById(id, callback) {
        db.get('SELECT * FROM users WHERE id = ?', [id], callback);
    }

    static async create({ name, email, password, role = 'user' }, callback) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
            db.run(sql, [name, email, hashedPassword, role], function (err) {
                if (err) return callback(err);
                callback(null, { id: this.lastID, name, email, role });
            });
        } catch (err) {
            callback(err);
        }
    }

    static async verifyPassword(email, password, callback) {
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) return callback(err);
            if (!user) return callback(null, false);

            const match = await bcrypt.compare(password, user.password);
            callback(null, match ? user : false);
        });
    }

    static deleteById(id, callback) {
        const sql = 'DELETE FROM users WHERE id = ?';
        db.run(sql, [id], function (err) {
            if (err) return callback(err);
            callback(null, this.changes);
        });
    }

    static deleteAll(callback) {
        const sql = 'DELETE FROM users';
        db.run(sql, function (err) {
            if (err) return callback(err);
            callback(null, this.changes);
        });
    }

    static async update(id, { name, email, password, role }, callback) {
        try {
            let updates = [];
            let params = [];

            if (name) { updates.push('name = ?'); params.push(name); }
            if (email) { updates.push('email = ?'); params.push(email); }
            if (role) { updates.push('role = ?'); params.push(role); }

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updates.push('password = ?');
                params.push(hashedPassword);
            }

            if (updates.length === 0) return callback(null, 0); // rien à modifier

            const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
            params.push(id);

            db.run(sql, params, function (err) {
                if (err) return callback(err);
                callback(null, this.changes);
            });
        } catch (err) {
            callback(err);
        }
    }
}

module.exports = User;
