let event_loop = require("event_loop"); // Required before gpio
let gpio = require("gpio");

let i2c = require("i2c");
let spi = require("spi");

let mcp = load(__dirname + "/mcp23017.js");
let at24c32 = load(__dirname + "/at24c32.js");
let ssd1306 = load(__dirname + "/ssd1306.js");
let sk9822_gpio = load(__dirname + "/sk9822_gpio.js");
let sk9822_spi = load(__dirname + "/sk9822_spi.js");

let devices = "";

if (mcp.init(i2c, 0x20)) {
    devices = devices + ("mcp23017 ");
    print("MCP23017 at:", mcp.getRWAddress().toString(16));
    mcp.reset();

    /*
    // Demo blinking LED and reading button
    print("GPIO blink/read demo...");
    mcp.pinMode(0, mcp.modeOutput);
    mcp.digitalWrite(0, true);
    mcp.pinMode(1, mcp.modeInputPullup);
    let speedMillis = 500;
    for (let i = 0; i < 10; i++) {
        mcp.digitalWrite(0, true);
        print(mcp.digitalRead(1));
        delay(speedMillis);
        mcp.digitalWrite(0, false);
        print(mcp.digitalRead(1));
        delay(speedMillis);
    }
    */

    // Demo a matrix keypad
    print("testing matrix keypad...");
    mcp.pinMode(8, mcp.modeInputPullup);
    mcp.pinMode(9, mcp.modeInputPullup);
    mcp.pinMode(10, mcp.modeInputPullup);
    mcp.pinMode(11, mcp.modeInputPullup);
    mcp.setupInterruptPin(8, mcp.triggerLow);
    mcp.setupInterruptPin(9, mcp.triggerLow);
    mcp.setupInterruptPin(10, mcp.triggerLow);
    mcp.setupInterruptPin(11, mcp.triggerLow);
    mcp.pinMode(12, mcp.modeOutput);
    mcp.pinMode(13, mcp.modeOutput);
    mcp.pinMode(14, mcp.modeOutput);
    mcp.pinMode(15, mcp.modeOutput);
    mcp.digitalWrite(12, true);
    mcp.digitalWrite(13, true);
    mcp.digitalWrite(14, true);
    mcp.digitalWrite(15, true);
    mcp.digitalRead(8);
    mcp.digitalRead(9);
    mcp.digitalRead(10);
    mcp.digitalRead(11);
    for (let i = 0; i < 50; i++) {
        for (let j = 12; j <= 15; j++) {
            mcp.digitalWrite(j, false);
            mcp.digitalWrite(j, true);
        }
        if (mcp.getLastInterruptPin() !== -1) {
            break;
        }
    }
    let intPin = mcp.getLastInterruptPin();
    print("Interrupt pin:", intPin);
    if (intPin !== -1) {
        let v = 0xFF - (mcp.getCapturedInterruptValue() >> 8);
        print("Matrix:", v.toString(16));
        die("done with demo");
    }
} else {
    print("MCP23017 not found");
}

if (at24c32.init(i2c, 0x50)) {
    devices = devices + ("at24c32 ");
    print("AT24C32 at:", at24c32.getRWAddress().toString(16));

    let memAddr = 0;
    at24c32.writeByte(memAddr++, 0x20); // DC32
    // No registry for SAO Maker IDs?
    // 0x05 is Longhorn Engineer
    // 0x49 is AND!XOR
    // 0x4A is 'J' for "JSON" protocol from badge.team (w/Badge id 'S' 0x53)
    // 0x4C is 'L' for "LIFE" protocol from badge.team (w/Badge id 'I' 0x49)
    // 0x54 is 'T' for "TEAM" protocol from badge.team (w/Badge id 'E' 0x45)
    at24c32.writeByte(memAddr++, 0x92); // Maker ID 
    at24c32.writeByte(memAddr++, 0x01); // Badge id
    // Begin custom data, format determined by previous 3 bytes.
    let message = "Hello world!";
    let buffer = [];
    for (let i = 0; i < message.length; i++) {
        // at24c32.writeByte(memAddr++, message.charCodeAt(i)); // Custom Data [Msg]
        buffer.push(message.at(i));
    }
    at24c32.writeByte(memAddr++, message.length); // Custom Data [Msg Length]
    at24c32.writeBytes(memAddr, buffer);

    print("DC", at24c32.readByte(0));
    print("Maker: ", at24c32.readByte(1).toString(16));
    print("Badge id: ", at24c32.readByte(2));

    // TODO: Check DC, Maker, Badge ID to determine how to read custom data.
    let len = at24c32.readByte(3);
    print(at24c32.readString(4, len));
    delay(2000);
} else {
    print("at24c32 not found (0xA0).");
}

if (ssd1306.init(i2c)) { // , 0x27
    devices = devices + ("ssd1306 ");
    print("SSD1306 at:", ssd1306.getRWAddress().toString(16));
} else {
    print("ssd1306 not found (0x27).");
}

if (ssd1306.getRWAddress() === -1 && at24c32.getRWAddress() === -1 && mcp.getRWAddress() === -1) {
    print("SDA=pin 15, SCL=pin 16. Pull-up resistors?");
} else {
    print("Found devices:", devices);
}

// We can't detect SK9822 devices. We'll just try to use them.
let sk9822 = undefined;
let useSpi = false;
if (useSpi) {
    sk9822_spi.init(spi);
    sk9822 = sk9822_spi;
} else {
    sk9822_gpio.init(gpio, "PA7", "PB3");
    sk9822 = sk9822_gpio;
}
let intensity = 20;
let index = 0;
for (let i = 0; i < 20; i++) {
    sk9822.writeStart();
    index++;
    if (index % 2 === 0) {
        sk9822.writeColor(128, 128, 0, intensity);
    }
    sk9822.writeColor(255, 0, 0, intensity);
    sk9822.writeColor(0, 255, 0, intensity);
    sk9822.writeColor(0, 0, 255, intensity);
    sk9822.writeColor(255, 255, 255, intensity);
    sk9822.writeColor(255, 255, 0, intensity);
    sk9822.writeColor(255, 0, 255, intensity);
    sk9822.writeColor(0, 255, 255, intensity);
    sk9822.writeColor(1, 0, 0, intensity);
    sk9822.writeColor(4, 0, 0, intensity);
    sk9822.writeColor(16, 0, 0, intensity);
    sk9822.writeColor(64, 0, 0, intensity);
    sk9822.writeStop(0);
    delay(500);
}

useSpi = true;
if (useSpi) {
    sk9822_spi.init(spi);
    sk9822 = sk9822_spi;
} else {
    sk9822_gpio.init(gpio, "PA7", "PB3");
    sk9822 = sk9822_gpio;
}
for (let i = 0; i < 20; i++) {
    sk9822.writeStart();
    index++;
    if (index % 2 === 0) {
        sk9822.writeColor(128, 128, 0, intensity);
    }
    sk9822.writeColor(255, 0, 0, intensity);
    sk9822.writeColor(0, 255, 0, intensity);
    sk9822.writeColor(0, 0, 255, intensity);
    sk9822.writeColor(255, 255, 255, intensity);
    sk9822.writeColor(255, 255, 0, intensity);
    sk9822.writeColor(255, 0, 255, intensity);
    sk9822.writeColor(0, 255, 255, intensity);
    sk9822.writeColor(1, 0, 0, intensity);
    sk9822.writeColor(4, 0, 0, intensity);
    sk9822.writeColor(16, 0, 0, intensity);
    sk9822.writeColor(64, 0, 0, intensity);
    sk9822.writeStop(0);
    delay(500);
}
