let i2c = require("i2c");
let lis2dh12 = load(__dirname + "/lis2dh12.js");

let ws2812 = require('ws2812');

let max = 255 / 6;
ws2812.setup({ pin: 2, count: 12 });

if (lis2dh12.init(i2c)) {
  print("Found LIS2DH12 at address 0x" + lis2dh12.getRWAddress().toString(16));

  print("who: ", lis2dh12.who());
  delay(1000);
  lis2dh12.reset();
  
  print("Tilt Flipper to change LED speed!");
  let i=0;
  while (true) {
    i++;
    ws2812.set(i%12, { red: 0, green: max, blue: max });
    ws2812.set((i+1)%12, { red: 0, green: max, blue: 0 });
    ws2812.set((i+2)%12, { red: 0, green: 0, blue: max });
    ws2812.set((i+3)%12, { red: max, green: max, blue: 0 });
    ws2812.set((i+4)%12, { red: max, green: 0, blue: max });
    ws2812.set((i+5)%12, { red: max, green: 0, blue: 0 });
    ws2812.set((i+6)%12, { red: max / 2, green: max / 2, blue: 0 });
    ws2812.set((i+7)%12, { red: 0, green: max, blue: max });
    ws2812.set((i+8)%12, { red: 0, green: max, blue: 0 });
    ws2812.set((i+9)%12, { red: 0, green: 0, blue: max });
    ws2812.set((i+10)%12, { red: max, green: max, blue: 0 });
    ws2812.set((i+11)%12, { red: max, green: 0, blue: max });    
    
    // send the data to the LEDs
    ws2812.update();

    let accel = lis2dh12.accel();
    let del = accel.y;
    if (del > 16000) {del=16000;}
    delay((16000-del)/50);
  }
} else {
  print("LIS2DH12 not found.");
}


