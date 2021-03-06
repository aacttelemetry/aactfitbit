import { Accelerometer } from "accelerometer";
import { Barometer } from "barometer";
import { BodyPresenceSensor } from "body-presence";
import { display } from "display";
import document from "document";
import { Gyroscope } from "gyroscope";
import { HeartRateSensor } from "heart-rate";
import { OrientationSensor } from "orientation";
import * as messaging from "messaging";
import { me } from "appbit";

me.appTimeoutEnabled = false; //Disable 2-minute timeout, on screen off.

const accelLabel = document.getElementById("accel-label");
const accelData = document.getElementById("accel-data");

const barLabel = document.getElementById("bar-label");
const barData = document.getElementById("bar-data");

const bpsLabel = document.getElementById("bps-label");
const bpsData = document.getElementById("bps-data");

const gyroLabel = document.getElementById("gyro-label");
const gyroData = document.getElementById("gyro-data");

const hrmLabel = document.getElementById("hrm-label");
const hrmData = document.getElementById("hrm-data");

const orientationLabel = document.getElementById("orientation-label");
const orientationData = document.getElementById("orientation-data");

//Seems one of these must be made for each element on index.gui
//As shown in the event listeners below, their text properties can be modified after stringifying the modifying text
const incomingLabel = document.getElementById("incoming-label");
const incomingData = document.getElementById("incoming-data");

//https://dev.fitbit.com/build/guides/user-interface/svg-components/buttons/
let mybutton2 = document.getElementById("mybutton2");
mybutton2.onactivate = function(evt) {
  console.log("CLICKED!");
}


const sensors = [];

var heart_last = 0;
var body_presence_last = false;
var barometer_last = 0;
var incoming;

//if (Accelerometer) -> "if accelerometer sensor is present"
if (Accelerometer) {
  const accel = new Accelerometer({ frequency: 1 });//Read accelerometer with frequency of 1 per second, batch of zero implied
  accel.addEventListener("reading", () => {
    accelData.text = JSON.stringify({
      x: accel.x ? accel.x.toFixed(1) : 0,
      y: accel.y ? accel.y.toFixed(1) : 0,
      z: accel.z ? accel.z.toFixed(1) : 0
    });
  });
  sensors.push(accel);
  accel.start();
} else {
  accelLabel.style.display = "none";
  accelData.style.display = "none";
}

if (Barometer) {
  const barometer = new Barometer({ frequency: 1 });
  barometer.addEventListener("reading", () => {
    barData.text = JSON.stringify({
      pressure: barometer.pressure ? parseInt(barometer.pressure) : 0
    });
    barometer_last = barometer.pressure ? parseInt(barometer.pressure) : 0
  });
  sensors.push(barometer);
  barometer.start();
} else {
  barLabel.style.display = "none";
  barData.style.display = "none";
}

if (BodyPresenceSensor) {
  const bps = new BodyPresenceSensor();
  bps.addEventListener("reading", () => {
    bpsData.text = JSON.stringify({
      presence: bps.present
    })
    body_presence_last = bps.present
  });
  sensors.push(bps);
  bps.start();
} else {
  bpsLabel.style.display = "none";
  bpsData.style.display = "none";
}

if (Gyroscope) {
  const gyro = new Gyroscope({ frequency: 1 });
  gyro.addEventListener("reading", () => {
    gyroData.text = JSON.stringify({
      x: gyro.x ? gyro.x.toFixed(1) : 0,
      y: gyro.y ? gyro.y.toFixed(1) : 0,
      z: gyro.z ? gyro.z.toFixed(1) : 0,
    });
  });
  sensors.push(gyro);
  gyro.start();
} else {
  gyroLabel.style.display = "none";
  gyroData.style.display = "none";
}

if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    hrmData.text = JSON.stringify({
      heartRate: hrm.heartRate ? hrm.heartRate : 0
    }); //Converts objects inside this array into a string object.
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
    //The below will just directly throw it to an array.
    if(body_presence_last == false || !(hrm.heartRate)){
      heart_last = 0;
    }else{
      heart_last = hrm.heartRate;
    }
  });
  sensors.push(hrm);
  hrm.start();
} else {
  hrmLabel.style.display = "none";
  hrmData.style.display = "none";
}

if (OrientationSensor) {
  const orientation = new OrientationSensor({ frequency: 60 });
  orientation.addEventListener("reading", () => {
    orientationData.text = JSON.stringify({
      quaternion: orientation.quaternion ? orientation.quaternion.map(n => n.toFixed(1)) : null
    });
  });
  sensors.push(orientation);
  orientation.start();
} else {
  orientationLabel.style.display = "none";
  orientationData.style.display = "none";
}

/*
//Comment this out on test runs
display.addEventListener("change", () => {
  // Automatically stop all sensors when the screen is off to conserve battery
  display.on ? sensors.map(sensor => sensor.start()) : sensors.map(sensor => sensor.stop());
});
*/
///////////////////////////////////////////////////////

messaging.peerSocket.onopen = function() {
  // Ready to send messages
  console.log("Ready to send!!")
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}

//Listen for stuff from the app (from the websocket) and update the text accordingly
messaging.peerSocket.onmessage = function(evt) {
  incomingData.text = JSON.stringify(evt.data)
}

setInterval(function(){
  var to_companion = {
    timestamp: Math.floor(Date.now()/1000),
    hr_arr: hrmData.text,
    hr_only: heart_last,
    pressure: barometer_last
  }
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send(to_companion);
  }
},1000);
