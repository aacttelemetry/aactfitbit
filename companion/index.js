// Import the messaging module
import * as messaging from "messaging";

const wsUri = "ws://192.168.1.72:12345";
const websocket = new WebSocket(wsUri);
/*
while(true){
  if(websocket){
    break;
  }else{
    websocket = new WebSocket(wsUri);
  }
}
*/
setTimeout(1000)
// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  // Output the message to the console
  console.log(JSON.stringify(evt.data));
  websocket.send(JSON.stringify(evt.data));
}

websocket.onopen = function(event) {
  console.log("WebSocket is open now.");
};

websocket.onclose = function(event) {
  console.log("WebSocket is closed now.");
};

websocket.addEventListener("message", onMessage);
function onMessage(evt) {
   var received = evt.data
   console.log("got: "+received);
   messaging.peerSocket.send(received);
}


setInterval(function(){
  console.log(websocket.readyState);
},1000);