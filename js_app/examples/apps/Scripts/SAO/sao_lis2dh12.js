// Demo for LIS2DH12 accelerometer data
// Component is: LIS2DH12
// Connect an LIS2DH12 SAO to the I2C bus of the Flipper Zero. 
// SDA=pin 15, SCL=pin 16, VCC=pin 9, GND=pin 8.
let i2c = require("i2c");
let lis2dh12 = load(__dirname + "/lis2dh12.js");

if (lis2dh12.init(i2c)) {
  print("Found LIS2DH12 at address 0x" + lis2dh12.getRWAddress().toString(16));

  print("who: ", lis2dh12.who());
  delay(1000);
  lis2dh12.reset();
  
  print("LIS2DH12 data:");
  while (true) {
    let accel = lis2dh12.accel();
    print(accel.x, accel.y, accel.z);
    delay(1000);
  }
} else {
  print("LIS2DH12 not found.");
}


