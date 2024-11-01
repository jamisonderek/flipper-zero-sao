let ws2812 = require('ws2812');

let max = 255 / 6;

ws2812.setup({ pin: 2, count: 7 });
ws2812.set(0, { red: 0, green: max, blue: max });
ws2812.set(1, { red: 0, green: max, blue: 0 });
ws2812.set(2, { red: 0, green: 0, blue: max });
ws2812.set(3, { red: max, green: max, blue: 0 });
ws2812.set(4, { red: max, green: 0, blue: max });
ws2812.set(5, { red: max, green: 0, blue: 0 });
ws2812.set(6, { red: max / 2, green: max / 2, blue: 0 });

ws2812.update();

let color = ws2812.getColor(5);
print("Color[5]", color.red, color.green, color.blue);


ws2812.setup({ pin: "pb3", count: 7 });
ws2812.set(0, { red: max, green: 0, blue: max });

ws2812.update();
