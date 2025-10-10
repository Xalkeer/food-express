const db = require('../bin/bdd');
const bcrypt = require('bcrypt');

class Restaurant {
    static all(callback) {
        db.all('SELECT * FROM restaurants', [], callback);
    }

    static findByName(name, callback) {
        db.get('SELECT * FROM restaurants WHERE email = ?', [name], callback);
    }

    static findById(id, callback) {
        db.get('SELECT * FROM users WHERE id = ?', [id], callback);
    }





}

module.exports = User;
