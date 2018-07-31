#!/usr/bin/env node

const awsIot = require('aws-iot-device-sdk');
const Mouse = require('node-mouse');
var m = new Mouse();
const username = 'stuart' // TODO: replace this
var stopped = false;


// AWS device
const device = awsIot.device({
  keyPath: 'certificates/stuarts_thing.private.key',
  certPath: 'certificates/stuarts_thing.cert.pem',
  caPath: 'certificates/root-CA.crt',
  clientId: `${username}-publish`,
      host: 'a2yujzh40clf9c.iot.us-east-2.amazonaws.com'
});


// Mouse move

const move = (event) => {
  if(!stopped) {
    var radian = Math.atan2( event.yDelta, event.xDelta);
    var angle = (radian*180)/Math.PI;
    var color = 'red';

    switch(angle) {
		case(0):
			color = 'blue';
			angle = 0;
			break;

		case(90):
			color = 'blue';
			angle = 90;
			break;

		case(180):
			color = 'yellow';
			angle = 180;
			break;

		case(-90):
			color = 'green';
			angle = 270;
			break;

		case(-180):
			color = 'purple'
			angle = 180;
			break;
	default:
  		if (angle >= 0 && angle < 90) {
  			color = 'blue';
  		} else if(angle >= -90 && angle < 0) {
  			angle = 360 - Math.abs(angle)
  			if(angle === 360) { angle = 0 }
  			color = 'green';
  		}
  		else if(angle <= -90 && angle > -180) {
  			angle = 90 + Math.abs(angle)
  			color = 'purple';
  		}
  		else if(angle >= 90 && angle < 180) {
  		  color = 'yellow';
  		}
  		break;
  	}

    stopped = true;

  	var speed = ( Math.abs(event.yDelta) + Math.abs(event.xDelta) );
    console.log(angle)
    console.log(speed)

    device.publish('stuart/mandala', JSON.stringify({
        'color': color,
        'angle': angle,
        'speed': speed,
        'stopped': false
    }));
  }
};

const stop = () => {
  if(!stopped) {
    console.log('stopped... click again to resume');
    stopped = true;
    device.publish('stuart/mandala', JSON.stringify({
        'stopped': true
    }));
  } else {
    console.log('resumed');
    device.publish('stuart/mandala', JSON.stringify({
        'stopped': false
    }));
  }
};

device.on('connect', () => {
  console.log('Publisher client connected to AWS IoT cloud.\n');
  m.on("move", (event) => {
      console.log(event);
      move(event);
  })

  m.on("left-down", (event) => {
      console.log(event);
      stop();
  })
});
