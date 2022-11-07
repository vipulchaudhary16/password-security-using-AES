const Aes = require("./AESUtills.js");

const encrypt = (plaintext, password, nBits) => {
  var blockSize = 16; // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
  if (!(nBits == 128 || nBits == 192 || nBits == 256)) return ""; // standard allows 128/192/256 bit keys
  plaintext = String(plaintext).utf8Encode();
  password = String(password).utf8Encode();

  var nBytes = nBits / 8; // no bytes in key (16/24/32)
  var pwBytes = new Array(nBytes);
  for (var i = 0; i < nBytes; i++) {
    pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
  }
  var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes)); // gives us 16-byte key
  key = key.concat(key.slice(0, nBytes - 16)); // expand key to 16/24/32 bytes long

  var counterBlock = new Array(blockSize);

  var nonce = new Date().getTime(); // timestamp: milliseconds since 1-Jan-1970
  var nonceMs = nonce % 1000;
  var nonceSec = Math.floor(nonce / 1000);
  var nonceRnd = Math.floor(Math.random() * 0xffff);

  for (var i = 0; i < 2; i++) counterBlock[i] = (nonceMs >>> (i * 8)) & 0xff;
  for (var i = 0; i < 2; i++)
    counterBlock[i + 2] = (nonceRnd >>> (i * 8)) & 0xff;
  for (var i = 0; i < 4; i++)
    counterBlock[i + 4] = (nonceSec >>> (i * 8)) & 0xff;

  var ctrTxt = "";
  for (var i = 0; i < 8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);

  var keySchedule = Aes.keyExpansion(key);

  var blockCount = Math.ceil(plaintext.length / blockSize);
  var ciphertxt = new Array(blockCount); // ciphertext as array of strings

  for (var b = 0; b < blockCount; b++) {
    for (var c = 0; c < 4; c++) counterBlock[15 - c] = (b >>> (c * 8)) & 0xff;
    for (var c = 0; c < 4; c++)
      counterBlock[15 - c - 4] = (b / 0x100000000) >>> (c * 8);

    var cipherCntr = Aes.cipher(counterBlock, keySchedule); // -- encrypt counter block --

    var blockLength =
      b < blockCount - 1 ? blockSize : ((plaintext.length - 1) % blockSize) + 1;
    var cipherChar = new Array(blockLength);

    for (var i = 0; i < blockLength; i++) {
      cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i);
      cipherChar[i] = String.fromCharCode(cipherChar[i]);
    }
    ciphertxt[b] = cipherChar.join("");
  }

  var ciphertext = ctrTxt + ciphertxt.join("");
  ciphertext = ciphertext.base64Encode();

  return ciphertext;
};

const decrypt = (ciphertext, password, nBits) => {
  var blockSize = 16;
  if (!(nBits == 128 || nBits == 192 || nBits == 256)) return "";
  ciphertext = String(ciphertext).base64Decode();
  password = String(password).utf8Encode();

  var nBytes = nBits / 8;
  var pwBytes = new Array(nBytes);
  for (var i = 0; i < nBytes; i++) {
    pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
  }
  var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
  key = key.concat(key.slice(0, nBytes - 16));
  var counterBlock = new Array(8);
  var ctrTxt = ciphertext.slice(0, 8);
  for (var i = 0; i < 8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);

  var keySchedule = Aes.keyExpansion(key);

  var nBlocks = Math.ceil((ciphertext.length - 8) / blockSize);
  var ct = new Array(nBlocks);
  for (var b = 0; b < nBlocks; b++)
    ct[b] = ciphertext.slice(8 + b * blockSize, 8 + b * blockSize + blockSize);
  ciphertext = ct;

  var plaintxt = new Array(ciphertext.length);

  for (var b = 0; b < nBlocks; b++) {
    for (var c = 0; c < 4; c++) counterBlock[15 - c] = (b >>> (c * 8)) & 0xff;
    for (var c = 0; c < 4; c++)
      counterBlock[15 - c - 4] =
        (((b + 1) / 0x100000000 - 1) >>> (c * 8)) & 0xff;

    var cipherCntr = Aes.cipher(counterBlock, keySchedule);

    var plaintxtByte = new Array(ciphertext[b].length);
    for (var i = 0; i < ciphertext[b].length; i++) {
      plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
      plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
    }
    plaintxt[b] = plaintxtByte.join("");
  }

  var plaintext = plaintxt.join("");
  plaintext = plaintext.utf8Decode();

  return plaintext;
};

if (typeof String.prototype.utf8Encode == "undefined") {
  String.prototype.utf8Encode = function () {
    return unescape(encodeURIComponent(this));
  };
}

if (typeof String.prototype.utf8Decode == "undefined") {
  String.prototype.utf8Decode = function () {
    try {
      return decodeURIComponent(escape(this));
    } catch (e) {
      return this; // invalid UTF-8? return as-is
    }
  };
}

if (typeof String.prototype.base64Encode == "undefined") {
  String.prototype.base64Encode = function () {
    if (typeof btoa != "undefined") return btoa(this); // browser
    if (typeof Buffer != "undefined")
      return new Buffer(this, "utf8").toString("base64"); // Node.js
    throw new Error("No Base64 Encode");
  };
}

if (typeof String.prototype.base64Decode == "undefined") {
  String.prototype.base64Decode = function () {
    if (typeof atob != "undefined") return atob(this); // browser
    if (typeof Buffer != "undefined")
      return new Buffer(this, "base64").toString("utf8"); // Node.js
    throw new Error("No Base64 Decode");
  };
}

module.exports = { encrypt, decrypt };

