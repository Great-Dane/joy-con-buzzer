import {
  connectJoyCon,
  connectedJoyCons,
  JoyConLeft,
  JoyConRight,
  GeneralController,
} from './joy-con-webhid.es.js';

const connectButton = document.querySelector('#connect-joy-cons');
const connectButtonRingCon = document.querySelector('#connect-ring-con');
const debugLeft = document.querySelector('#debug-left');
const debugRight = document.querySelector('#debug-right');
const showDebug = document.querySelector('#show-debug');
const rootStyle = document.documentElement.style;

connectButton.addEventListener('click', connectJoyCon);

const buzzInSound = new Audio('assets/buzz-in.mp3');

const visualize = (joyCon, packet) => {
  if (!packet?.actualOrientation) {
    return;
  }
  const {
    actualAccelerometer: accelerometer,
    buttonStatus: buttons,
    actualGyroscope: gyroscope,
    actualOrientation: orientation,
    actualOrientationQuaternion: orientationQuaternion,
    ringCon,
  } = packet;



  // test led and rumble
  if (buttons.a || buttons.up) {
    joyCon.blinkLED(0);
    buzzInSound.play();
  }
  if (buttons.b || buttons.down) {
    joyCon.setLED(0);
    buzzInSound.play();
  }
  if (buttons.x || buttons.right) {
    joyCon.resetLED(0);
    joyCon.rumble(600, 600, 0);
    buzzInSound.play();
  }
  if (buttons.y || buttons.left) {
    joyCon.rumble(600, 600, 0.5);
    buzzInSound.play();
  }
  if (buttons.home || buttons.capture) {
    //joyCon.setHomeLED(true);
    joyCon.setHomeLEDPattern(5, 1, 15, []);
    buzzInSound.play();
  }
  
  if (showDebug.checked) {
    const controller = joyCon instanceof JoyConLeft ? debugLeft : debugRight;
    controller.querySelector('pre').textContent =
      `${JSON.stringify(orientation, null, 2)}
    ${JSON.stringify(orientationQuaternion, null, 2)}
    ${JSON.stringify(gyroscope, null, 2)}
    ${JSON.stringify(accelerometer, null, 2)}
    `;
    const meterMultiplier = 300;
    controller.querySelector('#acc-x').value =
      accelerometer.x * meterMultiplier;
    controller.querySelector('#acc-y').value =
      accelerometer.y * meterMultiplier;
    controller.querySelector('#acc-z').value =
      accelerometer.z * meterMultiplier;

    const gyroscopeMultiplier = 300;
    controller.querySelector('#gyr-x').value =
      gyroscope.rps.x * gyroscopeMultiplier;
    controller.querySelector('#gyr-y').value =
      gyroscope.rps.y * gyroscopeMultiplier;
    controller.querySelector('#gyr-z').value =
      gyroscope.rps.z * gyroscopeMultiplier;
  }

};

// Joy-Cons may sleep until touched, so attach the listener dynamically.
setInterval(async () => {
  for (const joyCon of connectedJoyCons.values()) {
    if (joyCon.eventListenerAttached) {
      continue;
    }
    joyCon.eventListenerAttached = true;
    await joyCon.enableVibration();
    joyCon.on('hidinput', (event) => {
      visualize(joyCon, event.detail);
    });

  }
}, 2000);

showDebug.addEventListener('input', (e) => {
  document.querySelector('#debug').style.display = e.target.checked
    ? 'flex'
    : 'none';
});
