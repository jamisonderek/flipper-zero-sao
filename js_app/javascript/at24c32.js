({
    /**
     * let i2c=require("i2c");
     * at24c32.init(i2c, 0x50);
     * 
     * getRWAddress(); // returns the address of the I2C device
     * 
     * readByte(memAddr); // reads a byte from the memory address
     * 
     * readBytes(memAddr, length); // returns an array of bytes starting at memory address
     * 
     * readString(memAddr, length); // returns a string of bytes starting at memory address
     * 
     * writeByte(memAddr, data); // writes a byte to the memory address
     * 
     * writeBytes(memAddr, data); // writes an array of bytes starting at memory address
     */

    i2c: undefined,
    timeout: 100,
    _addr: -1,
    _scanAddress: function (min, max) {
        this._addr = -1;
        for (let addr = min; addr <= max; addr += 2) {
            if (this.i2c.isDeviceReady(addr, 20)) {
                this._addr = addr;
                break;
            }
        }
        return this._addr;
    },
    /**
     * Locates the AT23C32 device on the I2C bus.
     * @param {i2c} i2cType 
     * @param {number} deviceRWAddress
     * @returns true if device was found, false otherwise.
     */
    init: function (i2cType, deviceRWAddress) {
        this.i2c = i2cType;
        if (deviceRWAddress === undefined) {
            // Scan for I2C device in address range 0xA0 - 0xAE.
            return this._scanAddress(0xA0, 0xAE) !== -1;
        } else {
            return this._scanAddress(deviceRWAddress << 1, deviceRWAddress << 1) !== -1;
        }
    },
    /**
     * Call init() before using this function.
     * @returns {number} The address of the device or -1 if no device was found.
     */
    getRWAddress: function () {
        return (this._addr === -1) ? -1 : this._addr >> 1;
    },
    _getAddress: function () {
        return this._addr;
    },
    readByte: function (addr) {
        let buffer = this.i2c.writeRead(this._getAddress(), [(addr >> 8) & 0xFF, addr & 0xFF], 1, this.timeout);
        if (buffer.byteLength === 0) {
            return -1;
        } else {
            return Uint8Array(buffer)[0];
        }
    },
    readBytes: function (addr, length) {
        let buffer = this.i2c.writeRead(this._getAddress(), [(addr >> 8) & 0xFF, addr & 0xFF], length, this.timeout);
        if (buffer.byteLength === 0) {
            return undefined;
        } else {
            return Uint8Array(buffer);
        }
    },
    readString: function (addr, length) {
        let buffer = this.i2c.writeRead(this._getAddress(), [(addr >> 8) & 0xFF, addr & 0xFF], length, this.timeout);
        if (buffer.byteLength === 0) {
            return undefined;
        } else {
            let data = Uint8Array(buffer);
            let str = "";
            for (let i = 0; i < data.length; i++) {
                str = str + chr(data[i]);
            }
            return str;
        }
    },
    writeByte: function (addr, data) {
        return this.i2c.write(this._getAddress(), [(addr >> 8) & 0xFF, addr & 0xFF, data & 0xFF], this.timeout);
    },
    writeBytes: function (addr, data) {
        let buffer = [];
        buffer.push((addr >> 8) & 0xFF);
        buffer.push(addr & 0xFF);
        for (let i = 0; i < data.length; i++) {
            buffer.push(data[i]);
        }
        return this.i2c.write(this._getAddress(), buffer, this.timeout);
    },
});