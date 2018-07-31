const awsIot = require('aws-iot-device-sdk');
const Mouse = require('node-mouse');
var m = new Mouse();
const username = 'stuart' // TODO: replace this

const move = (event) => {
  if(!stopped) {
    var radian = Math.atan2( event.yDelta, event.xDelta);
    var angle = (radian*180)/Math.PI;
    var direction = angle;
    var color = 'red';

    if(angle >= -90 && angle <= 90) {
      direction = 90 - angle
      color = 'green'
    }
    else if(angle < -90 && angle > -180) {
      direction = 90 + Math.abs(angle)
      color = 'purple'
    }
    else if(angle > 90 && angle < 180) {
      direction = 180 + angle;
      color = 'yellow'
    }

    if ( direction % 1 !== 0  ) {
      // console.log(direction);
      orb.color(color);
      var speed = ( Math.abs(event.yDelta) + Math.abs(event.xDelta) );
      stopped = true;
      orb.roll(speed, direction).delay(300).then(() => {
          stopped = false;
      });

    }

  }
};

const stop = () => {
  if(!stopped) {
    console.log('stopped... click again to resume');
    stopped = true;
    orb.roll(0, 0);
    orb.setRawMotors({
      "lmode": "0x00",
      "lpower": "0",
      "rmode": "0x00",
      "rpower": "0",
    });
  } else {
    console.log('resumed');
    stopped = false;
  }

};

const device = awsIot.device({
  keyPath: 'certificates/stuarts_thing.private.key',
  certPath: 'certificates/stuarts_thing.cert.pem',
  caPath: 'certificates/root-CA.crt',
  clientId: `${username}-publish`,
      host: 'a2yujzh40clf9c.iot.us-east-2.amazonaws.com'
});
const topicNamespace = 'makers/challenge';

device.on('connect', () => {
  console.log('Publisher client connected to AWS IoT cloud.\n');
  m.on("mousemove", (event) => {
      console.log(event);
      // move(event);
    })

    m.on("mousedown", (event) => {
      console.log(event);
      // stop();
    })

  //
  // device.publish(`${topicNamespace}/answers`, JSON.stringify({
  //     'name': username,
  //     'answerToken': answerToken,
  //     'answer': answer
  // }));
});
