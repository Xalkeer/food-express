// models/User.js
const db = require('../bin/bdd');
const bcrypt = require('bcrypt');

class User {
    static all(callback) {
        db.all('SELECT id, name, email FROM users', [], callback);
    }

    static findByEmail(email, callback) {
        db.get('SELECT * FROM users WHERE email = ?', [email], callback);
    }

    static async create({ name, email, password }, callback) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.run(sql, [name, email, hashedPassword], function (err) {
                if (err) return callback(err);
                callback(null, { id: this.lastID, name, email });
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
}

module.exports = User;
