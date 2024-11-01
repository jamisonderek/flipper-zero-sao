let i2c = require("i2c");
let at24c32 = load(__dirname + "/at24c32.js");

// Format (LIFE) from https://badge.team/docs/standards/sao/binary_descriptor/
// "LIFE"
// name length
// driver name length
// driver data length
// extra drivers
// name
// driver name 
// driver data

if (at24c32.init(i2c, 0x50)) {
    print("AT24C32 at:", at24c32.getRWAddress().toString(16));

    let memAddr = 0;
    let header = "LIFE";
    let name = "Blinky";
    let driverName = "neopixel";
    let driverDataLen = 4;
    let extraDrivers = 0;
    let buffer = [];
    for (let i = 0; i < header.length; i++) {
        buffer.push(header.at(i));
    }
    at24c32.writeBytes(memAddr, buffer);
    memAddr += header.length;

    at24c32.writeByte(memAddr++, name.length);
    at24c32.writeByte(memAddr++, driverName.length);
    at24c32.writeByte(memAddr++, driverDataLen);
    at24c32.writeByte(memAddr++, extraDrivers);

    buffer = [];
    for (let i = 0; i < name.length; i++) {
        buffer.push(name.at(i));
    }
    at24c32.writeBytes(memAddr, buffer);
    memAddr += name.length;

    buffer = [];
    for (let i = 0; i < driverName.length; i++) {
        buffer.push(driverName.at(i));
    }
    at24c32.writeBytes(memAddr, buffer);
    memAddr += driverName.length;

    // Extra data for neopixel driver
    let numLeds = 16;
    let grb = 2;
    at24c32.writeBytes(memAddr, [(numLeds >> 8) & 0xFF, numLeds & 0xFF, grb, 0]);

    print("updated AT24C32");
} else {
    print("at24c32 not found (0xA0).");
}
