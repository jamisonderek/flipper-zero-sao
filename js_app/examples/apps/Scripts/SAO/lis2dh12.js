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
   * Locates the LIS2DH12 device on the I2C bus.
   * @param {i2c} i2cType 
   * @param {number} deviceRWAddress
   * @returns true if device was found, false otherwise.
   */
  init: function (i2cType, deviceRWAddress) {
      this.i2c = i2cType;
      if (deviceRWAddress === undefined) {
          // Scan for I2C device in address range 0x18 - 0x19.
          return this._scanAddress(0x18<<1, 0x19<<1) !== -1;
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
  readRegByte: function (reg) {
    let buffer = this.i2c.writeRead(this._addr, [reg], 1, this.timeout);
    if (buffer === undefined) {
      print("Sample:Err",reg);
      return undefined;
    }
    let data = Uint8Array(buffer);
    return data[0];
  },
  who: function () { // Hopefully returns 51 (0x33)
    return this.readRegByte(0x0F);
  },
  reset: function() {
    let reg1; // ReadReg CTRL_REG1 (0x20)
    let reg4; // ReadReg CTRL_REG4 (0x23)

    // set bdu bit (Block Data Update).
    reg4 = this.readRegByte(0x23);
    reg4 = reg4 | 0x80; // set bit 7
    this.i2c.write(this._addr, [0x23, reg4], this.timeout);

    // set dataRate to 25 Hz.
    reg1 = this.readRegByte(0x20);
    reg1 = (reg1 & 0x0F) | (0x30); // set bits 4 and 5
    this.i2c.write(this._addr, [0x20, reg1], this.timeout);

    // full scale 2g.
    reg4 = this.readRegByte(0x23);
    reg4 = reg4 & 0x3F; // clear bits 4 and 5
    this.i2c.write(this._addr, [0x23, reg4], this.timeout);

    // 12-bit resolution
    // ctrl_reg1.lpen = 0;
    // ctrl_reg4.hr   = 1;
    reg1 = this.readRegByte(0x20);
    reg4 = this.readRegByte(0x23);
    reg1 = reg1 & 0xF7; // clear bit 3 (lpen)
    reg4 = reg4 | 0x08; // set bit 4 (hr)
    this.i2c.write(this._addr, [0x20, reg1], this.timeout);
    this.i2c.write(this._addr, [0x23, reg4], this.timeout);

  },
  accel: function () {
      // Write command "1" and then read 4 bytes.
      let x = 0;
      let y = 0;
      let z = 0;
      let buffer = this.i2c.writeRead(this._addr, [0x28], 1, this.timeout);
      if (buffer === undefined) {
        print("Sample:Err-28");
        return undefined;
      }
      let data = Uint8Array(buffer);
      x = data[0];
      buffer = this.i2c.writeRead(this._addr, [0x29], 1, this.timeout);
      if (buffer === undefined) {
        print("Sample:Err-29");
        return undefined;
      }
      data = Uint8Array(buffer);
      x = x | (data[0]<<8);

      buffer = this.i2c.writeRead(this._addr, [0x2A], 1, this.timeout);
      if (buffer === undefined) {
        print("Sample:Err-2A");
        return undefined;
      }
      data = Uint8Array(buffer);
      y = data[0];
      buffer = this.i2c.writeRead(this._addr, [0x2B], 1, this.timeout);
      if (buffer === undefined) {
        print("Sample:Err-2B");
        return undefined;
      }
      data = Uint8Array(buffer);
      y = y | (data[0]<<8);

      buffer = this.i2c.writeRead(this._addr, [0x2C], 1, this.timeout);
      if (buffer === undefined) {
        print("Sample:Err-2C");
        return undefined;
      }
      data = Uint8Array(buffer);
      z = data[0];
      buffer = this.i2c.writeRead(this._addr, [0x2D], 1, this.timeout);
      if (buffer === undefined) {
        print("Sample:Err-2D");
        return undefined;
      }
      data = Uint8Array(buffer);
      z = z | (data[0]<<8);

      return {x:x, y:y, z:z};   
  }
});