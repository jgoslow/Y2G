var express = require('express');
var router = express.Router();
var app = require('../app');
var cache = app.get('cache');

var cacheCheck = function(req,res,next){
  if (!req.user) cache.prefix = 'Y2G:';
  else cache.prefix = 'Y2G-user:';
  var flash = req.session.flash[Object.keys(req.session.flash)[0]]
  //console.log(req)
  console.log('flash:'+flash)
  if (flash) cache.prefix += 'flash('+flash+'):' //console.log(req.session.flash)
  next()
}

// Clear Cache
router.get('/clearCache', function(req, res) {
  cache.del('*', function(){})
  res.redirect('/')
})

/* GET home page. */
router.get('/', cacheCheck, cache.route(), function(req, res) {
  if (req.query.clearCache) {
    console.log(cache)
    //cache.del('*', next())
  }
  res.render('index', {
    title: 'Home',
    bodyClasses: 'home',
    user: req.user
  });
});


/* GET About page. */
router.get('/about', cacheCheck, cache.route(), function(req, res) {
  res.render('pages/about', {
    title: 'About',
    user: req.user
  });
});

/* GET Resources page. */
router.get('/resources', cacheCheck, cache.route(), function(req, res) {
  res.render('pages/resources', {
    title: 'Resources',
    user: req.user
  });
});

/* GET Contact page. */
router.get('/contact', cacheCheck, cache.route(), function(req, res) {
  res.render('pages/contact', {
    title: 'Contact Us',
    user: req.user
  });
});


/* Additional Pages. */
router.get('/about-public-listings', cacheCheck, cache.route(), function(req, res) {
  res.render('pages/about-public-listings', {
    title: 'About Public Listings',
    user: req.user
  });
});
router.get('/privacy-policy', cacheCheck, cache.route(), function(req, res) {
  res.render('pages/privacy-policy', {
    title: 'Our Privacy Policy',
    user: req.user
  });
});
router.get('/terms', cacheCheck, cache.route(), function(req, res) {
  res.render('pages/terms', {
    title: 'Our Terms of Use',
    user: req.user
  });
});
router.get('/help', cacheCheck, cache.route(), function(req, res) {
  res.render('pages/help/volunteer', {
    title: 'Help out Y2G!',
    user: req.user
  });
});
  router.get('/help/public-listings', cacheCheck, cache.route(), function(req, res) {
    res.render('pages/help/public-listings', {
      title: 'Add public resources',
      user: req.user
    });
  });
  router.get('/help/spread-the-word', cacheCheck, cache.route(), function(req, res) {
    res.render('pages/help/spread-the-word', {
      title: 'Spread the word',
      user: req.user
    });
  });
  router.get('/help/beta-test', cacheCheck, cache.route(), function(req, res) {
    res.render('pages/help/beta-test', {
      title: 'Help us Beta Test',
      user: req.user
    });
  });
  router.get('/help/join', cacheCheck, cache.route(), function(req, res) {
    res.render('pages/help/join-the-team', {
      title: 'Join our Team',
      user: req.user
    });
  });

module.exports = router;
