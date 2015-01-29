
function initialize() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(44.983334, -93.26666999999999),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    panControl: true,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    scrollwheel: false,
    streetViewControl: true,
    overviewMapControl: true
  };

  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  var scripts = [ {url: '/javascripts/map_functions.js'}, {url: '/javascripts/map_interface.js'} ]

  loadScript([
    {url:'/javascripts/map_functions.js'},
    {url:'/javascripts/infobubble.js'},
    {url:'/javascripts/icons.js'}
  ]);

  //moment().format(); // Date Formatting Tool

}

var libs = [ {url: 'https://maps.googleapis.com/maps/api/js?v=3.exp&'+'callback=initialize'}, {url: '/javascripts/moment.js'} ]


window.onload = function(){
  loadScript(libs)
}



function loadScript(files, callback) {
  for (var i = 0; i < files.length; i++) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = files[i].url;
    document.body.appendChild(script);
  }
  if(typeof callback == "function") return callback();
}
