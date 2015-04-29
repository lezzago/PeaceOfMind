
var alertId;
var status;
var location;
var postIntervalId;
var count = 0;



// Pebble.addEventListener('Is ready', function(e) {
//   console.log(' Isready');
// });

Pebble.addEventListener('showConfiguration', function(e) {
  var ids = ['ownerName',
            'ownerNumber',
            'ownerEmail',
            'contact1Name',
            'contact1Number',
            'contact1Email',
            'contact2Name',
            'contact2Number',
            'contact2Email',
            'contact3Name',
            'contact3Number',
            'contact3Email',
            'contact4Name',
            'contact4Number',
            'contact4Email',
            'contact5Name',
            'contact5Number',
            'contact5Email'];
  var url = 'http://teampeaceofmind.github.io?';
  for (var key in ids) {
    var val = localStorage.getItem(ids[key]);
    if(val === null) {
      val = '';
    }
    var str = ids[key] + '=' + val + '&';
    url += str;
  }
  // Show config page
  //Pebble.openURL("http://google.com");
  //Pebble.openURL('http://client.flip.net.au/reno/circle.html');
  console.log('This is the url opened: ' + url);
  Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed',
  function(e) {
    var configuration = JSON.parse(decodeURIComponent(e.response));
    console.log('Configuration window returned: ', JSON.stringify(configuration));
    console.log('JSON: ' + JSON.stringify(configuration));
    if(JSON.stringify(configuration).length === 2) {
      console.log('This is empty');
    }
    else {
      for (var key in configuration) {
        localStorage.setItem(key, configuration[key]);
        console.log('key: ' + key + ', value: ' + configuration[key]);
      }
    }
    
  }
);

setInterval(location_func, 10000);
 
var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

var latitude;
var longitude;

function locationSuccess(pos) {
  //latitude = pos.coords.latitude;
  //longitude = pos.coords.longitude;
  latitude = '40.1094';
  longitude = '-88.2272';
  console.log("GPS Location Success");
  console.log('lat= ' + latitude + ' lon= ' + longitude);
}

function locationError(err) {
  console.log("GPS Location Error");
  console.log('location error (' + err.code + '): ' + err.message);
}

Pebble.addEventListener('ready', function(e) {
  
  console.log('ready');
  location_func();
});  //as soon as app is ready, start getting location


function location_func(e) {
  console.log('Location Func');
  //location = navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
  locationSuccess();
}



/****** post stuff ************/

function getLocalVariable(key) {
    var val = localStorage.getItem(key);
    if(val === null) {
      val = '';
    }
    return val;
}

var xhrRequest = function (url, type, params, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url, true);
  
  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify(params));
};



function initialPost() {
  var curTime = new Date();
  var accountToken = Pebble.getAccountToken();
  var data = {
    "access_token" : accountToken,
    "me" : {
      "name" : getLocalVariable('ownerName'),
      "phone" : getLocalVariable('ownerNumber'),
      "email" : getLocalVariable('ownerEmail')
    },
    "contacts" : [],
    "timeout":  120,
    "updates": [
      {	
        "access_token": accountToken,
        "coordinate": {
          "latitude": latitude,
          "longitude": longitude
        },
        "time": curTime,
        "status": status
      }
		]
  };
  for(var i = 1; i < 6; i++) {
    var name = getLocalVariable('contact' + i + 'Name');
    var phone = getLocalVariable('contact' + i + 'Number');
    var email = getLocalVariable('contact' + i + 'Email');
    if(name !== '') {
      data.contacts.push({ 
        "name" : name,
        "phone" : phone,
        "email" : email
      });
    }
  }
  var url = 'http://peaceofmindfor.me/api/alerts/new';
  console.log('initial data: ' + JSON.stringify(data));
  //send request
  xhrRequest(url, 'POST', data, 
            function(responseText) {
              var json = JSON.parse(responseText);
              alertId = json['alert_id'];
              console.log('initial post request made, alertId: ' + alertId);
            }
  );
  
}

function updatePost() {
  var curTime = new Date();
  var accountToken = Pebble.getAccountToken();
  var data = {
    "access_token": accountToken,
    "coordinate": {
			"latitude": latitude,
      "longitude": longitude
		},
		"time": curTime,
		"status": status
  };
  
  var url = 'http://peaceofmindfor.me/api/alerts/' + alertId;
  console.log('update data: ' + JSON.stringify(data));
  //send request
  xhrRequest(url, 'POST', data, 
            function(responseText) {
              console.log('update post request made with status: ' + status);
            }
  );
}




/********  status stuff ***********/

Pebble.addEventListener('appmessage', status_func);  //receive AppMessage for status

function status_func(e)
{
    //location_func();
    status = e.payload.STATUS;
    console.log("Message: " + status);
    
  if(count === 0) {
    initialPost();
    count = 1;
  }
    
    clearInterval(postIntervalId);
    
    if(status !== 0) {
      postIntervalId = setInterval(updatePost, 10000);
    }
}



