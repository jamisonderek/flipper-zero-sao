let spi = require("spi");
let sk9822 = load(__dirname + "/sk9822_spi.js");

sk9822.init(spi);

let intensity = 31;
let index = 0;
for (let i = 0; i < 20; i++) {
    sk9822.writeStart();
    index++;
    if (index % 2 === 0) {
        sk9822.writeColor(128, 128, 0, intensity);
    }
    sk9822.writeColor(255, 0, 0, intensity);
    sk9822.writeColor(0, 255, 0, intensity);
    sk9822.writeColor(0, 0, 255, intensity);
    sk9822.writeColor(255, 255, 255, intensity);
    sk9822.writeColor(255, 255, 0, intensity);
    sk9822.writeColor(255, 0, 255, intensity);
    sk9822.writeColor(0, 255, 255, intensity);
    sk9822.writeColor(1, 0, 0, intensity);
    sk9822.writeColor(4, 0, 0, intensity);
    sk9822.writeColor(16, 0, 0, intensity);
    sk9822.writeColor(64, 0, 0, intensity);
    sk9822.writeStop(0);
    delay(500);
}
