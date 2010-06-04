$(document).ready(function() {

  function liveUpdatePosition() {
    navigator.geolocation.watchPosition(function(position) {  
      handlePosition(position);
    });  
  }

  function handlePosition(position) {
    $.ajax({
      url: '/ride-with-a-local/locations.json',
      type: 'POST',
      data: {
        location: {
          taxi_id: $('#taxi_id').attr('value'),
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }
      },
      success: function(data, textStatus, xhr) {
        $('.message').html('Your location was updated to ' + position.coords.latitude + ', ' + position.coords.longitude).fadeIn(150);
      },
      error: function(xhr, textStatus) {
        $('.message').html('An error occurred - location not updated: ' + textStatus).fadeIn(150);
      }
    });
  }

  var overlays = [];

  function updateTaxis() {
    $.ajax({
      url: '/ride-with-a-local/taxis.json',
      type: 'GET',
      success: function(data, textStatus, xhr) {
        $.each(data.taxis, function(i) {
          var taxi = data.taxis[i];
          $.each(overlays, function(i) { overlays[i].setMap(null); });
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(taxi.locations[0].lat, taxi.locations[0].lon),
            title: taxi.name,
            icon: 'http://google-maps-icons.googlecode.com/files/taxi.png',
            map: map
          });
          overlays.push(marker);
          var infowindow = new google.maps.InfoWindow({
            content: 
            "<h3>"+taxi.name+"</h3>"+
            "<p>License No. "+taxi.license+"</p>"+
            "<p>"+taxi.description+"</p>"+
            "<img src='/ride-with-a-local"+taxi.photo_url+"' alt='car photo'/>"
          });
          google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
          });
          var trail = new google.maps.Polyline({
            path: taxi.locations.map(function(loc) {
              return new google.maps.LatLng(loc.lat, loc.lon); 
            })
          });
          overlays.push(trail);
          trail.setMap(map);
        });
      }
    });
  }

  var map;

  function loadMap() {
    /* icons from http://code.google.com/p/google-maps-icons/wiki/TransportationIcons */
    map = new google.maps.Map(
      document.getElementById("map-container"), {
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
    });
    map.setCenter(new google.maps.LatLng(39.232253,-76.674271));
    var m = new google.maps.Marker({
      position: new google.maps.LatLng(39.285596,-76.616212),
      title: 'BWI',
      map: map,
      icon: 'http://google-maps-icons.googlecode.com/files/steamtrain.png'
    });
    m = new google.maps.Marker({
      position: new google.maps.LatLng(39.173524,-76.670022),
      title: 'BWI',
      map: map,
      icon: 'http://google-maps-icons.googlecode.com/files/airport.png'
    });
    updateTaxis();
    setInterval(updateTaxis, 30000);
  }

  if ($('#map-container').size() > 0) {
    loadMap();
  }

  if ($('form#new_location').size() > 0) {
    liveUpdatePosition();
  }

  $("#schedule img").click(function() {
    if ($("#schedule div").css('display') !== 'none') {
      $("#schedule div").hide();
    } else {
      $("#info div").hide();
      $("#schedule div").show();
    }
  });
  $("#info img").click(function() {
    if ($("#info div").css('display') !== 'none') {
      $("#info div").hide();
    } else {
      $("#schedule div").hide();
      $("#info div").show();
    }
  });
});
