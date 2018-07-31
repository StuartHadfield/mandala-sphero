const awsIot = require('aws-iot-device-sdk');
const moment = require('moment'); // for DateTime formatting
const username = 'stuart' // TODO: replace this

const sphero = require("sphero");
const spheroId = "D8:AA:0C:8A:ED:4A"
const orb = sphero(spheroId)

const quadrant = process.argv[2];
if(!quadrant) {
	console.log("missing quadrant");
	process.exit(1);
}

function quadrantAngleTransform(angle, quadrant) {
	var transformed = angle;
	if (quadrant === 1) {
		// noop
	} else {
		transformed = transformed + (90)*(quadrant-1)
	}
	return (transformed % 360)
}

orb.connect(() => {
	console.log("connected...")
	console.log("calibrating...");
	orb.startCalibration().delay(5000).then(() => {
		orb.finishCalibration();
		console.log("calibration successful!");
		console.log("move mouse to control sphero");
	});
})

orb.disconnect(() => {

});

const device = awsIot.device({
	keyPath: 'certificates/stuarts_thing.private.key',
	certPath: 'certificates/stuarts_thing.cert.pem',
	caPath: 'certificates/root-CA.crt',
	clientId: `${username}-subscribe`,
    host: 'a2yujzh40clf9c.iot.us-east-2.amazonaws.com'
});

const topicName = 'stuart/mandala'

device.on('connect', () => {
	console.log('Subscriber client connected to AWS IoT cloud.\n');
	device.subscribe(topicName);
	console.log(`Subscribed to ${topicName}.`);
});

device.on('message', (topicName, payload) => {
	let message = JSON.parse(payload.toString());
	orb.color('red')
	speed = message.speed;
	angle = message.angle;
	stopped = message.stopped;
	if(stopped) {
		console.log('stopping');
		orb.roll(0, 0);
		orb.setRawMotors({
			"lmode": "0x00",
			"lpower": "0",
			"rmode": "0x00",
			"rpower": "0",
		});
	} else {
		var newAngle = quadrantAngleTransform(angle, quadrant)
		console.log(`Quadrant ${quadrant}: Moving in direction ${newAngle} with speed ${speed}`)
		orb.roll(speed, newAngle).delay(800).then(() => {
			orb.roll(0, newAngle)
			stopped = false;
		});
	}
});
