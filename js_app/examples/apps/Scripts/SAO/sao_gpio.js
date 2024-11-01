let event_loop = require("event_loop"); // Required before gpio
let gpio = require("gpio");

let gpioPin1 = "PA7";
print(gpioPin1, "is GPIO1");
let gpioPin2 = "PB3";
print(gpioPin2, "is GPIO2");

let gpio1 = gpio.get(gpioPin1);
gpio1.init({ direction: "out", outMode: "push_pull" });

let gpio2 = gpio.get(gpioPin2);
gpio2.init({ direction: "in", inMode: "plain_digital" });

let speedMillis = 500;
for (let i = 0; i < 10; i++) {
    gpio1.write(true);
    print(gpio2.read());
    delay(speedMillis);
    gpio1.write(false);
    print(gpio2.read());
    delay(speedMillis);
}