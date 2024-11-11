// Demo a https://github.com/todbot/TouchwheelSAO
// Components are: ATtiny816
// Connect an Touchwheel SAO to the I2C bus of the Flipper Zero.
// SDA=pin 15, SCL=pin 16, VCC=pin 9, GND=pin 8, GPIO1=pin 2.
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

function touchwheelRead(addr) {
  let data_buf = i2c.writeRead(addr, [0x00], 1, 100);
  if (data_buf === undefined) {
    return undefined;
  } else {
    return Uint8Array(data_buf)[0];
  }
}

function touchwheelRgb(addr, r, g, b) {
    i2c.write(addr, [15, r]); delay(20);
    i2c.write(addr, [16, g]); delay(20);
    i2c.write(addr, [17, b]);
}

let addr = i2c_find_first_device();
if (addr === -1) {
    print("I2C device not found");
    print("Please connect a Touchwheel SAO to the Flipper Zero.");
    print("SDA=pin 15, SCL=pin 16,  VCC=pin 9, GND=pin 8.");
} else {
    print("I2C device found at address: " + (addr >> 1).toString(16));
    delay(1000);

    touchwheelRgb(addr,0,0,0);
    delay(1000);
    touchwheelRgb(addr,128,128,128);
    delay(2000);
    touchwheelRgb(addr,128,0,0);
    delay(1000);
    touchwheelRgb(addr,0,128,0);
    delay(1000);
    touchwheelRgb(addr,0,0,128);
    delay(1000);
    touchwheelRgb(addr,128,128,0);
    delay(1000);
    touchwheelRgb(addr,128,0,128); 
    delay(1000);
    touchwheelRgb(addr,0,128,128); 
    delay(1000);

    for (let i=0; i<1000;i++) {
        let position = touchwheelRead(addr);
        print ("Position: ", position,"/255");
        delay(100);
    }
}
