({
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
     * Locates the SAMPLE device on the I2C bus.
     * @param {i2c} i2cType 
     * @param {number} deviceRWAddress
     * @returns true if device was found, false otherwise.
     */
    init: function (i2cType, deviceRWAddress) {
        this.i2c = i2cType;
        if (deviceRWAddress === undefined) {
            // Scan for I2C device in address range 0x78 - 0x7A.
            return this._scanAddress(0x78, 0x7A) !== -1;
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
    foo: function () {
        this.i2c.write(this._addr, [0,1,2], this.timeout);
    },
    bar: function () {
        // Write command "1" and then read 4 bytes.
        let buffer = this.i2c.writeRead(this._addr, [1], 4, this.timeout);
        if (buffer === undefined) {
          print("Sample:Err-1")
          return undefined;
        }
        let data = Uint8Array(buffer);
        let x = ((data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0]);
        return x;   
    }
});