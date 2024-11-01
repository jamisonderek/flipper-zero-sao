// NOTE: The ws2812 module is still under development. Function names may change.
let ws2812 = require('ws2812');

let max = 255 / 6;

ws2812.setup({ pin: 2, count: 12 });

for (let i=0; i<100000;i++) {
// does not update the LEDs when called, only updates the internal buffer
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

delay(70);

}

let color = ws2812.getColor(6);
print("Color[6]", color.red, color.green, color.blue);


ws2812.setup({ pin: "pb3", count: 7 });
ws2812.set(0, { red: max, green: 0, blue: max });
ws2812.update();
