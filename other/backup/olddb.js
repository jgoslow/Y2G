SELECT
CONCAT('db.listings.insert({
  _id: ' , id , ',
  owner: "', LOWER(name) ,'",
  type: "' , listing_type , '",
  title: "' , title , '",
  description: "' , description , '",
  content: "' , content , '",
  address: "' , street , '",
  city: "", state: "",
  zip: "' , zip , '",
  latLng: {
    lat: ' , y_lat , ',
    lng: ' , x_long , '
  },
  created: "' , u_created , '",
  active: "' , active , '"
});

db.users.insert({
  username: "', LOWER(name) ,'",
  name: "' , name , '",
  email: "' , email , '",
  phone: "' , phone , '"
});')

FROM listing
