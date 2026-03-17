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
const debugGeneral = document.querySelector('.debug-general');
const showDebug = document.querySelector('#show-debug');
const rootStyle = document.documentElement.style;

const controllerMap = {
  8198: 'Mikaela',
  8199: 'Dane',
};

connectButton.addEventListener('click', connectJoyCon);

const buzzInSound = new Audio('assets/buzz-in.mp3');
let isActiveBuzz = false; // True if a controller has buzzed in and the 5-second timer is active

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleBuzz(joyCon) {
  if (isActiveBuzz) {
      return;
  } else {
      isActiveBuzz = true;
      buzzInSound.play();
      debugGeneral.querySelector('pre').textContent = `${controllerMap[joyCon.device.productId] || 'Unknown Controller: ${joyCon.device.productId}'} has buzzed in!`;
      debugGeneral.querySelector('pre').textContent += `\nBuzzers are now locked for 5 seconds.`;
      debugGeneral.querySelector('pre').textContent += JSON.stringify(joyCon.device, null, 2);
      await delay(5000);
  }
  isActiveBuzz = false;
  joyCon.rumble(600, 600, 0.5); // Let players know their buzzers are active again with a rumble
}

const handleInput = (joyCon, packet) => {
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
  const productId = joyCon.device.productId;



  // test led and rumble
  if (buttons.a || buttons.up) {
    // joyCon.blinkLED(0);
    handleBuzz(joyCon);
  }
  if (buttons.b || buttons.down) {
    // joyCon.setLED(0);
    buzzInSound.play();
    debugGeneral.querySelector('pre').textContent = `${controllerMap[productId] || 'Unknown Controller: ${productId}'} has buzzed in!`;
  }
  if (buttons.x || buttons.right) {
    // joyCon.resetLED(0);
    // joyCon.rumble(600, 600, 0);
    buzzInSound.play();
    debugGeneral.querySelector('pre').textContent = `${controllerMap[productId] || 'Unknown Controller: ${productId}'} has buzzed in!`;
  }
  if (buttons.y || buttons.left) {
    // joyCon.rumble(600, 600, 0.5);
    buzzInSound.play();
    debugGeneral.querySelector('pre').textContent = `${controllerMap[productId] || 'Unknown Controller: ${productId}'} has buzzed in!`;
  }
  if (buttons.home || buttons.capture) {
    //joyCon.setHomeLED(true);
    // joyCon.setHomeLEDPattern(5, 1, 15, []);
    buzzInSound.play();
    debugGeneral.querySelector('pre').textContent = `${controllerMap[productId] || 'Unknown Controller: ${productId}'} has buzzed in!`;
  }
  if (buttons.l || buttons.r) {
    buzzInSound.play();
    debugGeneral.querySelector('pre').textContent = `${controllerMap[productId] || 'Unknown Controller: ${productId}'} has buzzed in!`;
  }
  if (buttons.zl || buttons.zr) {
    buzzInSound.play();
    debugGeneral.querySelector('pre').textContent = `${controllerMap[productId] || 'Unknown Controller: ${productId}'} has buzzed in!`;
  }
  
  if (showDebug.checked) {
    const controller = joyCon instanceof JoyConLeft ? debugLeft : debugRight;
    controller.querySelector('pre').textContent =
      `
      ${JSON.stringify(joyCon.device.productId, null, 2)}
      ${JSON.stringify(buttons, null, 2)}
    `;
    
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
    joyCon.setLED(0);
    joyCon.on('hidinput', (event) => {
      handleInput(joyCon, event.detail);
    });

  }
}, 2000);

showDebug.addEventListener('input', (e) => {
  document.querySelector('#debug').style.display = e.target.checked
    ? 'flex'
    : 'none';
});
