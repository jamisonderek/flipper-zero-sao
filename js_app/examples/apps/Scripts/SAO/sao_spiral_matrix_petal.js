// Demo for https://github.com/Hack-a-Day/2024-Supercon-8-Add-On-Badge/tree/main/hardware/sao/petal_matrix
// Component is: AS1115 I2C display driver
// Connect an Spiral Matrix Petal SAO to the I2C bus of the Flipper Zero. 
// SDA=pin 15, SCL=pin 16, VCC=pin 9, GND=pin 8.
let i2c = require("i2c");

function i2c_find_first_device() {
    let addr = -1;
    for (let try_addr = 0; try_addr !== 0xff; try_addr++) {
        if (i2c.isDeviceReady(try_addr, 5)) {
            addr = try_addr;
            break;
        }
    }
    return addr;
}

function readReg(addr, reg) {
  let data_buf = i2c.writeRead(addr, [reg], 1, 100);
  if (data_buf === undefined) {
    return undefined;
  } else {
    return Uint8Array(data_buf)[0];
  }
}

function petalRgb(addr, r, g, b) {
  let old_b = readReg(addr,2); // 2 b
  let old_r = readReg(addr,3); // 3 r
  let old_g = readReg(addr,4); // 4 g
  i2c.write(addr, [2, (old_b & 0x7F) | b]); delay(20);
  i2c.write(addr, [3, (old_r & 0x7F) | r]); delay(20);
  i2c.write(addr, [4, (old_g & 0x7F) | g]);
}

let addr = i2c_find_first_device();
if (addr === -1) {
    print("I2C device not found");
    print("Please connect a Petal SAO to the Flipper Zero.");
    print("SDA=pin 15, SCL=pin 16,  VCC=pin 9, GND=pin 8.");
} else {
    print("I2C device found at address: " + (addr >> 1).toString(16));
    delay(1000);

    print("Init...");
    i2c.write(addr, [0x09, 0x00], 100); // raw pixel mode (not 7-seg) 
    i2c.write(addr, [0x0A, 0x09], 100); // intensity (of 16) 
    i2c.write(addr, [0x0B, 0x07], 100); // enable all segments
    i2c.write(addr, [0x0C, 0x81], 100); // undo shutdown bits 
    i2c.write(addr, [0x0D, 0x00], 100); //  
    i2c.write(addr, [0x0E, 0x00], 100); // no crazy features
    i2c.write(addr, [0x0F, 0x00], 100); // turn off display test mode 

    print("Leds...");
    for (let z=1;z<=8;z++) {
        i2c.write(addr, [z, 0], 100);
    }
    delay(500);

    petalRgb(addr,0,0,0);
    delay(1000);
    petalRgb(addr,128,128,128);
    delay(2000);
    petalRgb(addr,128,0,0);
    delay(1000);
    petalRgb(addr,0,128,0);
    delay(1000);
    petalRgb(addr,0,0,128);
    delay(1000);
    petalRgb(addr,128,128,0);
    delay(1000);
    petalRgb(addr,128,0,128); 
    delay(1000);
    petalRgb(addr,0,128,128); 
    delay(1000);

    for (let z=1;z<=8;z++) {
        i2c.write(addr, [z, 0], 100);
    }

    // Each string of LEDs are 7 long (1, 2, 4, 8, 16, 32, 64).
    for (let bits=2; bits<=128; bits*=2) {
        let status = false;
        print("bits", bits-1);
        // Loop over each of the 8 strings of LEDs
        for (let led=1; led<=8; led++) {
            status = i2c.write(addr, [led, bits-1], 100);
            delay(200);
        }
    }
}
