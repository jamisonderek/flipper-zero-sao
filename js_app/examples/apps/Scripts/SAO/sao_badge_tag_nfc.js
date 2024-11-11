// Demo for https://hackaday.io/project/198165-badge-tag-nfc-sao
// NFC Component is: NXP NT3H2211W0FT1
// Connect an Badge Tag NFC SAO to the I2C bus of the Flipper Zero. 
// SDA=pin 15, SCL=pin 16, VCC=pin 9, GND=pin 8.
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

function pad2Hex(val) {
    return val < 16 ? "0" + val.toString(16) : val.toString(16);
}

function getUid(addr) {
    let data_buf = i2c.writeRead(addr, [0x00], 7, 100);
    if (data_buf === undefined) {
        return undefined;
    }

    let data = Uint8Array(data_buf);

    let uid = pad2Hex(data[0]);
    for (let i = 1; i < data.length; i++) {
        uid += " " + pad2Hex(data[i]);
    }

    return uid;
}

function writeUrl(addr, url) {
    let status = true;
    let writeDelay = 100;
    
    // CONFIG BLOCK.
    let write_buf = [0x01, 0x03, url.length + 5, 0xD1,
        0x01, // START 
        url.length + 1, // LEN 
        0x55, // END 
        0x04]; // https://
    
    for (let i = 0; i < url.length; i++) {
        write_buf.push(url.charCodeAt(i));
        if (write_buf.length === 17) {
            status = status && i2c.write(addr, write_buf, 100);
            delay(writeDelay);
            write_buf = [write_buf[0]+1];
        }
    }

    while (write_buf[0] !== 5) {
        for (let i = write_buf.length; i < 17; i++) {
            write_buf.push(0x00);
        }
        status = status && i2c.write(addr, write_buf, 100);
        delay(writeDelay);    
        write_buf = [write_buf[0]+1];
    }

    return status;
}

let addr = i2c_find_first_device();
if (addr === -1) {
    print("I2C device not found");
    print("Please connect a Badge Tag NFC SAO device to the Flipper Zero.");
    print("SDA=pin 15, SCL=pin 16,  VCC=pin 9, GND=pin 8.");
} else {
    print("I2C device found at address: " + (addr >> 1).toString(16));
    delay(1000);

    print("Writing URL...");
    
//    if (!writeUrl(addr, "github.com/jamisonderek/flipper-zero-tutorials/wiki")) {
//        print("Error writing URL");
//    }

//    if (!writeUrl(addr, "youtube.com/@TalkingSasquach")) {
//        print("Error writing URL");
//    }

    if (!writeUrl(addr, "youtube.com/@MrDerekJamison")) {
        print("Error writing URL");
    }
    
    print ("ID " + getUid(addr));

    let data_buf = i2c.writeRead(addr, [0x01], 16, 100);
    let data = Uint8Array(data_buf);
    let payloadLen = data[4];
    print ("Payload length: ", payloadLen);

    let msg = "";
    for (let reg = 0x01; reg<0x05; reg++) {
        data_buf = i2c.writeRead(addr, [reg], 16, 100);
        if (data_buf === undefined) {
            print ("Error ", pad2Hex(reg));
            delay(500);
        }
        data = Uint8Array(data_buf);
        for (let i = 0; i < data.length; i++) {
            if (reg === 0x00 || (reg === 0x1 && i <6)) {
                msg = msg + pad2Hex(data[i])+ " ";
            } else if (reg === 0x01 && i === 6 && data[i] === 0x04) {
                msg = msg + "[https://]";
            } else if (reg === 0x01 && i === 6) {
                msg = msg + "[0x" + pad2Hex(data[i]) + "]";
            } else if (data[i] < 32 || data[i] > 126) {
                msg = msg + ((data[i] === 0) ? "." : "?");
            } else {
                msg = msg + chr(data[i]);
            }
        }
        print (pad2Hex(reg) + " " + msg);
        msg = "";
        delay(500);
    }
}
