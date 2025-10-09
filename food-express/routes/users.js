var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('la routes des users');
});

/* POST ajout d'un user */
router.post('/register', function(req, res, next) {
    const user = req.body;
    if (!user || !user.name || !user.email || !user.password) {
        return res.status(400).send('Le user doit avoir un nom et un email');
    }
    let userData = [];
    if (fs.existsSync(USERS_FILE)) {
        const fileData = fs.readFileSync(USERS_FILE);
        if (fileData) userData = JSON.parse(fileData);
    }
    userData.push(user);
    fs.writeFileSync(USERS_FILE, JSON.stringify(userData, null, 2));
    res.status(201).json({message: 'User ajouté avec succès', user: user});

});

module.exports = router;
