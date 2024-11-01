// SK9822 RGB LED strip example using GPIO

({
    gpio: undefined,
    sck: undefined,
    mosi: undefined,
    /**
     * Initializes an SK9822 using GPIO control.
     * @param {any} gpio
     */
    init: function (gpio, dataPin, clockPin) {
        this.gpio = gpio;

        if (dataPin === undefined) {
            dataPin = "PA7";
            print(dataPin, "is data");
        }
        if (clockPin === undefined) {
            clockPin = "PB3";
            print(clockPin, "is clock");
        }
        this.mosi = gpio.get(dataPin);
        this.mosi.init({ direction: "out", outMode: "push_pull" });
        this.sck = gpio.get(clockPin);
        this.sck.init({ direction: "out", outMode: "push_pull" });
    },
    writeByte: function (data) {
        for (let i = 0; i < 8; i++) {
            let mask = 1 << (7 - i);
            this.mosi.write((data & mask) === mask);
            this.sck.write(true);
            this.sck.write(false);
        }
    },
    writeStart: function () {
        this.writeByte(0);
        this.writeByte(0);
        this.writeByte(0);
        this.writeByte(0);
    },
    writeStop: function (b) {
        this.writeByte(b);
        this.writeByte(b);
        this.writeByte(b);
        this.writeByte(b);
    },
    writeColor: function (r, g, b, i) {
        if (i === undefined || i > 31) {
            i = 31;
        } if (i < 0) {
            i = 0;
        }
        this.writeByte(0xE0 | (i & 31));
        this.writeByte(b);
        this.writeByte(g);
        this.writeByte(r);
    }
});

