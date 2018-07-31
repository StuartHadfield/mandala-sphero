const awsIot = require('aws-iot-device-sdk');
const moment = require('moment'); // for DateTime formatting
const username = 'stuart' // TODO: replace this

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

});
