let i2c = require("i2c");
let mcp = load(__dirname + "/mcp23017.js");

if (mcp.init(i2c, 0x20)) {
    print("MCP23017 at:", mcp.getRWAddress().toString(16));
    mcp.reset();

    // Demo a matrix keypad
    print("testing matrix keypad...");
    mcp.pinMode(0, mcp.modeOutput);
    mcp.pinMode(1, mcp.modeOutput);
    mcp.pinMode(2, mcp.modeOutput);
    mcp.pinMode(3, mcp.modeOutput);

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
            mcp.digitalWrite(j - 12, true); // Turn on LED
            mcp.digitalWrite(j, true);
            mcp.digitalWrite(j - 12, false); // Turn off LED
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
        let col = 0;
        let row = 0;
        if ((v & 0x0F) === 0x01) {
            row = 1;
        } else if ((v & 0x0F) === 0x02) {
            row = 2;
        } else if ((v & 0x0F) === 0x04) {
            row = 3;
        } else if ((v & 0x0F) === 0x08) {
            row = 4;
        }

        if ((v & 0xF0) === 0x10) {
            col = 1;
        } else if ((v & 0xF0) === 0x20) {
            col = 2;
        } else if ((v & 0xF0) === 0x40) {
            col = 3;
        } else if ((v & 0xF0) === 0x80) {
            col = 4;
        }
        print("Row:", row, "Col:", col);
        print("Switch:", (row - 1) * 4 + col);
    } else {
        print("No key pressed");
    }
} else {
    print("MCP23017 not found");
}
