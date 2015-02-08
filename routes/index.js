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


/* Additional Pages. */
router.get('/about-public-listings', function(req, res) {
  res.render('pages/about-public-listings', {
    title: 'About Public Listings',
    user: req.user
  });
});
router.get('/privacy-policy', function(req, res) {
  res.render('pages/privacy-policy', {
    title: 'Our Privacy Policy',
    user: req.user
  });
});
router.get('/terms', function(req, res) {
  res.render('pages/terms', {
    title: 'Our Terms of Use',
    user: req.user
  });
});
router.get('/help', function(req, res) {
  res.render('pages/help/volunteer', {
    title: 'Help out Y2G!',
    user: req.user
  });
});
  router.get('/help/public-listings', function(req, res) {
    res.render('pages/help/public-listings', {
      title: 'Add public resources',
      user: req.user
    });
  });
  router.get('/help/spread-the-word', function(req, res) {
    res.render('pages/help/spread-the-word', {
      title: 'Spread the word',
      user: req.user
    });
  });
  router.get('/help/beta-test', function(req, res) {
    res.render('pages/help/beta-test', {
      title: 'Help us Beta Test',
      user: req.user
    });
  });
  router.get('/help/join', function(req, res) {
    res.render('pages/help/join-the-team', {
      title: 'Join our Team',
      user: req.user
    });
  });


module.exports = router;
