let i2c = require("i2c");

let mcp = load(__dirname + "/mcp23017.js");

if (mcp.init(i2c, 0x20)) {
    print("MCP23017 at:", mcp.getRWAddress().toString(16));
    mcp.reset();

    // Demo LEDs
    print("LEDs 0-5");

    for (let pins = 0; pins <= 5; pins++) {
        mcp.pinMode(pins, mcp.modeOutput);
        mcp.digitalWrite(pins, false);
    }

    let speedMillis = 100;
    let pinDir = 1;
    let pin = 0;
    for (let i = 0; i < 50; i++) {
        pin += pinDir;
        if (pin > 5) {
            pin = 5;
            pinDir = -1;
        } else if (pin < 0) {
            pin = 0;
            pinDir = 1;
        }
        mcp.digitalWrite(pin, true);
        delay(speedMillis);
        mcp.digitalWrite(pin, false);
    }

    // Set all pins to input
    for (let pins = 0; pins < 16; pins++) {
        mcp.pinMode(pins, mcp.modeInput);
    }
}