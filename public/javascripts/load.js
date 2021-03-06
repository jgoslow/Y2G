
function initialize() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(44.983334, -93.26666999999999),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    panControl: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    scrollwheel: false,
    streetViewControl: false,
    overviewMapControl: true
  };

  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  loadScript([
      {url: '/javascripts/concat.y2g.js'}
  ]);

  //moment().format(); // Date Formatting Tool

}

var libs = [ {url: 'https://maps.googleapis.com/maps/api/js?v=3.exp&'+'callback=initialize'} ]


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
