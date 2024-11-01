let i2c = require("i2c");
let at24c32 = load(__dirname + "/at24c32.js");

if (at24c32.init(i2c, 0x50)) {
    print("AT24C32 at:", at24c32.getRWAddress().toString(16));

    // Assume SAO.69 format...
    let dc = at24c32.readByte(0);
    let maker = at24c32.readByte(1);
    let badge = at24c32.readByte(2);

    // Read format (SAO.69) of our badge...
    if (dc === 32 && maker === 0x42 && badge < 0x10) {
        let len = at24c32.readByte(3);
        print("DC", dc);
        print("Maker: ", maker.toString(16));
        print("Badge id: ", badge);
        print("length", len);
        print("Data:", at24c32.readString(4, len));
    } else if (maker === 0x49 && badge === 0x46) {
        // Read LIFE format...
        let header = at24c32.readString(0, 4);
        let nameLen = at24c32.readByte(4);
        let driverNameLen = at24c32.readByte(5);
        let driverDataLen = at24c32.readByte(6);
        let _extraDrivers = at24c32.readByte(7);
        let name = at24c32.readString(8, nameLen);
        let driverName = at24c32.readString(8 + nameLen, driverNameLen);
        let driverData = at24c32.readBytes(8 + nameLen + driverNameLen, driverDataLen);
        print("Header:", header);
        print("Name:", name);
        print("DriverName:", driverName);
        if (driverName === "neopixel" && driverDataLen === 4) {
            print("LEDs", driverData[0] << 8 | driverData[1]);
            if (driverData[2] === 2) {
                print("LED Order:", "GRB");
            } else {
                print("LED Order:", driverData[2]);
            }
        }
    } else {
        print("DC", dc);
        print("Maker: ", maker.toString(16));
        print("Badge id: ", badge);
    }
}