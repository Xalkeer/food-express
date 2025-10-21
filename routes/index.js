var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: '3APIS - FoodExpress',
        message: 'On vous invite à tester le projet sur Postman !'
    });
});


module.exports = router;
