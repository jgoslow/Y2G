var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-9244021-11']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var analytics = function(){}

analytics.location = function(){
  if (localStorage.getItem('search')) {
    _gaq.push(['_setCustomVar',
        1 // Slot
      , 'Search Term' // Category
      , localStorage.getItem('search') // Value
      , 2 // Scope
    ])
    _gaq.push(['_setCustomVar',
        1 // Slot
      , 'Search Radius' // Category
      , localStorage.getItem('radius') // Value
      , 2 // Scope
    ])
  }
}
analytics.location()


if (params.account == 'confirmed') {
  _gaq.push(['_trackEvent', 'Account', 'Create', 'Confirmed', 5]); // Analytics
  _gaq.push(['_trackPageview','/account/create-confirmed']) // Analytics
}

jQuery(function(){
  $('.give-feedback').click(function(){
    _gaq.push(['_trackEvent', 'Give Feedback', 'click', 'google form', 1]);
  })
})
