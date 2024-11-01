// SK9822 RGB LED strip example using SPI

({
    spi: undefined,
    /**
     * Initializes an SK9822 using GPIO control.
     * @param {any} spi
     */
    init: function (spi) {
        this.spi = spi;
    },
    writeStart: function () {
        this.spi.write([0, 0, 0, 0]);
    },
    writeStop: function (b) {
        this.spi.write([b, b, b, b]);
    },
    writeColor: function (r, g, b, i) {
        if (i === undefined || i > 31) {
            i = 31;
        } if (i < 0) {
            i = 0;
        }
        this.spi.write([0xE0 | (i & 31), b, g, r]);
    }
});
