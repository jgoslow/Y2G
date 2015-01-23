var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Home',
    bodyClasses: 'home',
    user: req.user
  });
});

/* GET About page. */
router.get('/about', function(req, res) {
  res.render('pages/about', {
    title: 'About',
    user: req.user
  });
});

/* GET Resources page. */
router.get('/resources', function(req, res) {
  res.render('pages/resources', {
    title: 'Resources',
    user: req.user
  });
});

/* GET Contact page. */
router.get('/contact', function(req, res) {
  res.render('pages/contact', {
    title: 'Contact Us',
    user: req.user
  });
});

module.exports = router;
