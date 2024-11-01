let i2c = require("i2c");
let at24c32 = load(__dirname + "/at24c32.js");

// Format (SOA.69):
// DC year
// Maker ID
// Badge Id
// Custom Data

// No registry for SAO Maker IDs, here are some known ones:
//   0x05 is Longhorn Engineer
//   0x49 is AND!XOR
//   0x49 is 'I' for "LIFE" protocol from badge.team (w/Badge id 'F' 0x46)
//   0x49 is 'E' for "TEAM" protocol from badge.team (w/Badge id 'A' 0x41)
//   0x53 is 'S' for "JSON" protocol from badge.team (w/Badge id 'O' 0x4F)

if (at24c32.init(i2c, 0x50)) {
    print("AT24C32 at:", at24c32.getRWAddress().toString(16));

    let memAddr = 0;
    at24c32.writeByte(memAddr++, 32); // DC32
    at24c32.writeByte(memAddr++, 0x42); // Maker ID 
    at24c32.writeByte(memAddr++, 0x01); // Badge id
    // Begin custom data, format determined by previous 3 bytes.
    let message = "Hello world!";
    let buffer = [];
    for (let i = 0; i < message.length; i++) {
        buffer.push(message.at(i));
    }
    at24c32.writeByte(memAddr++, message.length); // Custom Data [Msg Length]
    at24c32.writeBytes(memAddr, buffer);

    print("updated AT24C32");
} else {
    print("at24c32 not found (0xA0).");
}
