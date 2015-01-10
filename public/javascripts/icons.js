// Image Variables (icon and shadow)
var garden_image = new google.maps.MarkerImage("/images/map/garden.png",
  new google.maps.Size(39, 47),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 47));
var garden_visited = new google.maps.MarkerImage("/images/map/garden.visited.png",
  new google.maps.Size(39, 47),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 47));
var garden_shadow = new google.maps.MarkerImage("/images/map/garden.shadow.png",
  new google.maps.Size(67, 47),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 47));
var garden_shape = {
  coord: [20, 0, 21, 1, 22, 2, 23, 3, 24, 4, 26, 5, 27, 6, 27, 7, 35, 8, 35, 9, 35, 10, 35, 11, 35, 12, 34, 13, 34, 14, 34, 15, 34, 16, 34, 17, 34, 18, 34, 19, 33, 20, 33, 21, 33, 22, 33, 23, 33, 24, 33, 25, 33, 26, 33, 27, 33, 28, 38, 29, 38, 30, 32, 31, 32, 32, 33, 33, 33, 34, 33, 35, 33, 36, 33, 37, 33, 38, 33, 39, 33, 40, 17, 41, 17, 43, 19, 45, 19, 46, 15, 46, 15, 45, 2, 43, 2, 41, 0, 40, 0, 39, 0, 38, 0, 37, 0, 36, 0, 35, 0, 34, 0, 33, 1, 32, 3, 31, 3, 30, 4, 29, 4, 28, 5, 27, 5, 26, 6, 25, 6, 24, 6, 23, 7, 22, 7, 21, 7, 20, 8, 19, 8, 18, 9, 17, 9, 16, 9, 15, 9, 14, 9, 13, 9, 12, 6, 11, 7, 10, 7, 9, 8, 8, 9, 7, 10, 6, 11, 5, 12, 4, 14, 3, 15, 2, 16, 1, 18, 0, 20, 0],
  type: 'poly'
};
var farmer_image = new google.maps.MarkerImage("/images/map/gardener.png",
  new google.maps.Size(46, 46),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 46));
var farmer_visited = new google.maps.MarkerImage("/images/map/gardener.visited.png",
  new google.maps.Size(46, 46),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 46));
var farmer_shadow = new google.maps.MarkerImage("/images/map/gardener.shadow.png",
  new google.maps.Size(72, 46),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 46));
var farmer_shape = {
  coord: [27, 0, 29, 1, 30, 2, 29, 3, 29, 4, 29, 5, 30, 6, 34, 7, 36, 8, 36, 9, 36, 10, 36, 11, 37, 12, 38, 13, 39, 14, 40, 15, 41, 16, 42, 17, 42, 18, 41, 19, 45, 20, 32, 21, 32, 22, 31, 23, 31, 24, 30, 25, 29, 26, 29, 27, 28, 28, 28, 29, 28, 30, 28, 31, 28, 32, 27, 33, 27, 34, 28, 35, 28, 36, 28, 37, 28, 38, 28, 39, 28, 40, 28, 41, 29, 42, 29, 43, 29, 44, 27, 45, 18, 45, 16, 44, 16, 43, 16, 42, 16, 41, 16, 40, 16, 39, 16, 38, 16, 37, 16, 36, 16, 35, 16, 34, 16, 33, 16, 32, 15, 31, 15, 30, 14, 29, 13, 28, 12, 27, 11, 26, 10, 25, 9, 24, 8, 23, 7, 22, 6, 21, 5, 20, 5, 19, 4, 18, 3, 17, 1, 16, 1, 15, 0, 14, 1, 13, 1, 12, 2, 11, 3, 10, 14, 9, 15, 8, 17, 7, 22, 6, 21, 5, 21, 4, 21, 3, 21, 2, 21, 1, 21, 0, 27, 0],
  type: 'poly'
};
var mulch_image = new google.maps.MarkerImage("/images/map/organic.png",
  new google.maps.Size(44, 42),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 42));
var mulch_visited = new google.maps.MarkerImage("/images/map/organic.visited.png",
  new google.maps.Size(44, 42),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 42));
var mulch_shadow = new google.maps.MarkerImage("/images/map/organic.shadow.png",
  new google.maps.Size(68, 42),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 42));
var mulch_shape = {
  coord: [21, 0, 21, 1, 25, 2, 26, 3, 26, 4, 30, 5, 31, 6, 32, 7, 35, 8, 35, 9, 35, 10, 35, 11, 35, 12, 39, 13, 39, 14, 39, 15, 40, 16, 39, 17, 39, 18, 39, 19, 40, 20, 41, 21, 42, 22, 43, 23, 43, 24, 43, 25, 42, 26, 41, 27, 42, 28, 42, 29, 42, 30, 37, 31, 40, 32, 41, 33, 42, 34, 42, 35, 41, 36, 38, 37, 30, 38, 28, 39, 14, 40, 13, 41, 11, 41, 10, 40, 10, 39, 5, 38, 3, 37, 4, 36, 4, 35, 3, 34, 3, 33, 1, 32, 1, 31, 1, 30, 1, 29, 2, 28, 0, 27, 0, 26, 0, 25, 0, 24, 1, 23, 3, 22, 3, 21, 3, 20, 3, 19, 3, 18, 3, 17, 4, 16, 8, 15, 7, 14, 7, 13, 6, 12, 7, 11, 9, 10, 9, 9, 9, 8, 9, 7, 10, 6, 11, 5, 14, 4, 19, 3, 18, 2, 19, 1, 19, 0, 21, 0],
  type: 'poly'
};
var tools_image = new google.maps.MarkerImage("/images/map/tools.png",
  new google.maps.Size(42, 43),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 43));
var tools_visited = new google.maps.MarkerImage("/images/map/tools.visited.png",
  new google.maps.Size(42, 43),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 43));
var tools_shadow = new google.maps.MarkerImage("/images/map/tools.shadow.png",
  new google.maps.Size(68, 43),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 43));
var tools_shape = {
  coord: [26, 0, 29, 1, 29, 2, 30, 3, 30, 4, 30, 5, 40, 6, 41, 7, 41, 8, 41, 9, 41, 10, 41, 11, 41, 12, 41, 13, 40, 14, 40, 15, 40, 16, 39, 17, 39, 18, 38, 19, 37, 20, 36, 21, 35, 22, 34, 23, 33, 24, 34, 25, 34, 26, 34, 27, 34, 28, 34, 29, 33, 30, 32, 31, 30, 32, 28, 33, 27, 34, 25, 35, 16, 36, 31, 37, 15, 38, 14, 39, 12, 40, 11, 41, 11, 42, 10, 42, 9, 41, 8, 40, 8, 39, 7, 38, 7, 37, 7, 36, 8, 35, 8, 34, 9, 33, 9, 32, 10, 31, 11, 30, 12, 29, 11, 28, 10, 27, 10, 26, 9, 25, 8, 24, 6, 23, 6, 22, 4, 21, 4, 20, 3, 19, 3, 18, 2, 17, 2, 16, 1, 15, 1, 14, 0, 13, 0, 12, 1, 11, 2, 10, 2, 9, 4, 8, 5, 7, 6, 6, 8, 5, 9, 4, 11, 3, 13, 2, 16, 1, 21, 0, 26, 0],
  type: 'poly'
};


var typeIcon = function(type) {
  //console.log(type);
  switch (type) {
    case 'gardener':
      this.main = farmer_image;
      this.visited = farmer_visited;
      this.shadow = farmer_shadow;
      this.shape = farmer_shape
      break;
    case 'farmer':
      this.main = farmer_image;
      this.visited = farmer_visited;
      this.shadow = farmer_shadow;
      this.shape = farmer_shape
      break;
    case 'garden':
      this.main = garden_image;
      this.visited = garden_visited;
      this.shadow = garden_shadow;
      this.shape = garden_shape
      break;
    case 'tools':
      this.main = tools_image;
      this.visited = tools_visited;
      this.shadow = tools_shadow;
      this.shape = tools_shape
      break;
    case 'organic':
      this.main = mulch_image;
      this.visited = mulch_visited;
      this.shadow = mulch_shadow;
      this.shape = mulch_shape
      break;
    case 'mulch':
      this.main = mulch_image;
      this.visited = mulch_visited;
      this.shadow = mulch_shadow;
      this.shape = mulch_shape
      break;
  }
};
