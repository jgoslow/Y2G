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


// Misc. Pages
/* GET About Public Listings page. */
router.get('/public-listings', function(req, res) {
  res.render('pages/public-listings', {
    title: 'About Public Listings',
    user: req.user
  });
});

/* GET About Privacy Protection page. */
router.get('/privacy-protect', function(req, res) {
  res.render('pages/privacy-protect', {
    title: 'About Privacy Protection',
    user: req.user
  });
});


module.exports = router;
