const QRCode = require('qrcode');

const roomId = Math.random().toString(36).substring(2, 10);
const deepLink = `myapp://join?room=${roomId}`;

console.log("Room ID =", roomId);
console.log("Deep link =", deepLink);

QRCode.toString(deepLink, { type: 'terminal' }, function (err, url) {
  console.log(url);
});
