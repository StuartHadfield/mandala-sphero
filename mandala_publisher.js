#!/usr/bin/env node

const awsIot = require('aws-iot-device-sdk');
const Mouse = require('node-mouse');
var m = new Mouse();
const username = 'stuart'
var stopped = false;
var direction = 0;

// AWS device
const device = awsIot.device({
	keyPath: 'certificates/stuarts_thing.private.key',
	certPath: 'certificates/stuarts_thing.cert.pem',
	caPath: 'certificates/root-CA.crt',
	clientId: `${username}-publish`,
	host: 'a2yujzh40clf9c.iot.us-east-2.amazonaws.com'
});

const sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

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
				
				direction = 0
				// angle = 90;
				break;

			case(180):
				color = 'yellow';
				direction = 270
				// angle = 180;
				break;

			case(-90):
				color = 'green';
				// angle = 270;
				direction = 180
				break;

			case(-180):
				color = 'purple'
				//angle = 180;
				direction = 270
				break;
		default:
			if (angle >= 0 && angle < 90) {
				direction = 90 - angle
				color = 'blue';
			} else if(angle >= -90 && angle < 0) {
				angle = 360 - Math.abs(angle)
				direction = 90 + (360 - angle)
				color = 'green';
			} else if(angle <= -90 && angle > -180) {
				angle = 90 + Math.abs(angle)
				direction = 180 + (270 - angle)
				color = 'purple';
			} else if(angle >= 90 && angle < 180) {
				direction = 360 - angle
				color = 'yellow';
			}
			break;
		}


		var speed = ( Math.abs(event.yDelta) + Math.abs(event.xDelta) );
		// console.log(direction)
		device.publish('stuart/mandala', JSON.stringify({
			'color': color,
			'angle': direction,
			'speed': speed,
			'stopped': false
		}));
	}
};

const debounce = (fn, time) => {
  let timeout;

  return function() {
    const functionCall = () => fn.apply(this, arguments);
    
    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  }
}

const stop = () => {
	if(!stopped) {
		console.log('stopped... click again to resume');
		stopped = true;
		device.publish('stuart/mandala', JSON.stringify({
			'stopped': true
		}));
	} else {
		stopped = false;
		console.log('resumed');
		device.publish('stuart/mandala', JSON.stringify({
			'stopped': false
		}));
	}
};

m.on("mousemove", (event) => {
	//move(event)
	move(event, debounce((e) => {
			console.log(e)
	}, 1000));
});

m.on("click", (event) => {
	console.log(event);
	stop();
});

device.on('connect', () => {
	console.log('Publisher client connected to AWS IoT cloud.\n');
});


