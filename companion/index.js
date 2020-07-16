// Import the messaging module
import * as messaging from "messaging";

const wsUri = "ws://192.168.1.85:8765";
var websocket = WebSocket(wsUri);
var temp = [];
var init_send = false;
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
// Listen for the onmessage event (coming from the Fitbit)
messaging.peerSocket.onmessage = function(evt) {
  // Output the message to the console
  console.log(JSON.stringify(evt.data));
  /*
  temp.push(evt.data);
  // And send to the client, but only if it's there; else, just hold the queue
  if (websocket.readyState==1){
    websocket.send(JSON.stringify(temp));
    temp = [];
  }
  */
  //wait until identifying message has been sent
  if (init_send == true){
    websocket.send(JSON.stringify(evt.data));//don't use queue
  }
  
}

websocket.onopen = function(event) {
  console.log("WebSocket is open now.");
  websocket.send("fitbit");//theoretically this should always be the first message sent
  init_send = true;
};

websocket.onclose = function(event) {
  console.log("WebSocket is closed now.");
  init_send = false;
};

websocket.addEventListener("message", onMessage);
function onMessage(evt) {
   var received = evt.data
   console.log("got: "+received);
   messaging.peerSocket.send(received);//Send data to actual watch
}

//check and print the current state of the websocket
//since it is typically set correctly (not stuck in 0 or 2), there is no need to change the port and target
//0,1,2,3 - connecting, open, closing, closed
setInterval(function(){
  console.log(websocket.readyState);
  if(websocket.readyState == 3){
    websocket = WebSocket(wsUri) //automatically attempt to reconnect by recreating the socket
  }//note that the rpi is such that it will automatically reconnect, so long as it's running
},1000);