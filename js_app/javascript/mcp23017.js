/**
 * MCP23017 I2C 16-bit I/O Expander
 * 
 * let i2c = require("i2c");
 * Call init(i2c); or init(i2c, deviceAddress); before using any other function.
 * Call reset(); to reset the device into known state (bank 1 registers, interrupt pins [mirrored, push-pull, active low]).
 * call pinMode(pin, mode); to set the pin mode (modeOutput, modeInput, modeInputPullup). pin0-7 is portA, pin8-15 is portB.
 * call setupInterruptPin(pin, trigger); to setup an interrupt pin (triggerLow, triggerHigh, triggerChange).
 * call clearInterruptPin(pin); to clear an interrupt pin.
 * call digitalRead(pin); to read the digital value of a pin.
 * call digitalWrite(pin, value); to write a digital value to a pin (true=on, false=off).
 * call getLastInterruptPin(); to get the last pin that triggered an interrupt.
 * call getCapturedInterruptValue(); to get the value of all the pins when the interrupt was triggered.
 * 
 */
({
    i2c: undefined,
    timeout: 100,
    _addr: -1,
    portA: 0x00,
    portB: 0x10,
    dataA: 0x0,
    dataB: 0x0,
    triggerLow: false,
    triggerHigh: true,
    triggerChange: 2,
    modeOutput: 10,
    modeInput: 11,
    modeInputPullup: 12,
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
     * Locates the MCP23017 device on the I2C bus.
     * @param {i2c} i2cType 
     * @param {number} deviceRWAddress
     * @returns true if device was found, false otherwise.
     */
    init: function (i2cType, deviceRWAddress) {
        this.i2c = i2cType;
        if (deviceRWAddress === undefined) {
            // Scan for I2C device in address range 0x40 - 0x4E.
            return this._scanAddress(0x40, 0x4E) !== -1;
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
    _useBank1: function () {
        let addr = this._getAddress();
        if (addr === -1) {
            return false;
        }
        // If we are in bank 0, then register 0x0B is IOCON. If we are in bank 1, then register 0x0B is ignored.
        let buffer = this.i2c.writeRead(addr, [0x0B], 1, this.timeout);
        if (buffer === undefined) {
            return false;
        }
        let data = Uint8Array(buffer)[0];
        data = data | 0x80; // Set BANK flag to Bank 1.
        this.i2c.write(addr, [0x0B, data], this.timeout);
        return true;
    },
    setupInterrupts: function (shouldMirror, openDrain, signalPolarity) {
        let addr = this._getAddress();
        if (addr === -1) {
            return false;
        }
        let config = 0x80; // IOCON.BANK = 1 (portA in register 0x00, portB in register 0x10)
        config = config | 0x20; // IOCON.SEQOP = 1 (Address pointer does not increment)
        config = config | 0x08; // IOCON.HAEN = 1 (Address pins are always enabled)
        if (shouldMirror) {
            config = config | 0x40; // IOCON.MIRROR = 1 (INTA and INTB pins are both triggered when an interrupt occurs)
        }
        if (openDrain) {
            config = config | 0x04; // ODR = 1 (The INT pin is open-drain)
        }
        if (signalPolarity) {
            config = config | 0x02; // INTPOL = 1 (The INT pin is active high)
        }
        this.i2c.write(addr, [0x05, config], this.timeout);
        return true;
    },
    reset: function () {
        return this._useBank1() && this.setupInterrupts(true, false, false);
    },
    setDirectionGPIO: function (direction, port) {
        let addr = this._getAddress();
        if (addr === -1) {
            return false;
        }
        // Direction bit (0 = output, 1 = input) [IO7 - IO0]
        this.i2c.write(addr, [0x00 + port, direction], this.timeout);
    },
    readGPIO: function (port) {
        let addr = this._getAddress();
        if (addr === -1) {
            return -1;
        }
        let buffer = this.i2c.writeRead(addr, [0x09 + port], 1, this.timeout);
        if (buffer === undefined) {
            return -1;
        }
        return Uint8Array(buffer)[0];
    },
    writeGPIO: function (value, port) {
        let addr = this._getAddress();
        if (addr === -1) {
            return false;
        }
        this.i2c.write(addr, [0x09 + port, value], this.timeout);
        return true;
    },
    pinMode: function (pin, mode) {
        let addr = this._getAddress();
        if (addr === -1 || pin < 0 || pin > 15) {
            return false;
        }
        let port = this.portA;
        if (pin >= 8) {
            port = this.portB;
            pin = pin - 8;
        }
        let buffer = this.i2c.writeRead(addr, [0x0 + port], 1, this.timeout);
        if (buffer === undefined) {
            return false;
        }
        let direction = Uint8Array(buffer)[0];
        // If mode is an input also read the pullup register
        if (mode === this.modeInput || mode === this.modeInputPullup) {
            buffer = this.i2c.writeRead(addr, [0x06 + port], 1, this.timeout);
            if (buffer === undefined) {
                return false;
            }
        }
        let pullup = Uint8Array(buffer)[0];
        if (mode === this.modeOutput) {
            direction = direction & ~(1 << pin);
            return this.i2c.write(addr, [0x00 + port, direction], this.timeout);
        } else if (mode === this.modeInput) {
            direction = direction | (1 << pin);
            this.i2c.write(addr, [0x00 + port, direction], this.timeout);
            pullup = pullup & ~(1 << pin);
            return this.i2c.write(addr, [0x06 + port, pullup], this.timeout);
        } else if (mode === this.modeInputPullup) {
            direction = direction | (1 << pin);
            this.i2c.write(addr, [0x00 + port, direction], this.timeout);
            pullup = pullup | (1 << pin);
            return this.i2c.write(addr, [0x06 + port, pullup], this.timeout);
        }
        return false;
    },
    digitalRead: function (pin) {
        let addr = this._getAddress();
        if (addr === -1 || pin < 0 || pin > 15) {
            return -1;
        }
        let port = this.portA;
        if (pin >= 8) {
            port = this.portB;
            pin = pin - 8;
        }
        let data = this.readGPIO(port);
        if (data === -1) {
            return -1;
        }
        return (data & (1 << pin)) !== 0;
    },
    digitalWrite: function (pin, value) {
        let addr = this._getAddress();
        if (addr === -1 || pin < 0 || pin > 15) {
            return false;
        }
        let port = this.portA;
        let data = this.dataA;
        if (pin >= 8) {
            port = this.portB;
            data = this.dataB;
            pin = pin - 8;
        }
        // let data = this.readGPIO(port);
        //if (data === -1) {
        //return false;
        //}
        if (value) {
            data = data | (1 << pin);
        } else {
            data = data & ~(1 << pin);
        }

        if (port === this.portA) {
            this.dataA = data;
        } else {
            this.dataB = data;
        }
        return this.writeGPIO(data, port);
    },
    setupInterruptPin: function (pin, trigger) {
        let addr = this._getAddress();
        if (addr === -1 || pin < 0 || pin > 15) {
            return false;
        }
        let port = this.portA;
        if (pin >= 8) {
            port = this.portB;
            pin = pin - 8;
        }
        // current interrupt control register (1=DEFVAL, 0=previous pin value)
        let buffer = this.i2c.writeRead(addr, [0x04 + port], 1, this.timeout);
        if (buffer === undefined) {
            print("MCP23017:Err-CI")
            return false;
        }
        let intcon = Uint8Array(buffer)[0];

        // Get the current default value register (if trigger on high/low)
        let defval = 0;
        if (trigger === this.triggerLow || trigger === this.triggerHigh) {
            // Get the current default value register
            buffer = this.i2c.writeRead(addr, [0x03 + port], 1, this.timeout);
            if (buffer === undefined) {
                print("MCP23017:Err-DV")
                return false;
            }
            defval = Uint8Array(buffer)[0];
        }

        if (trigger === this.triggerChange) {
            intcon = intcon & ~(1 << pin);
            this.i2c.write(addr, [0x04 + port, intcon], this.timeout);
        } else if (trigger === this.triggerLow) {
            defval = defval | (1 << pin);
            this.i2c.write(addr, [0x03 + port, defval], this.timeout);
            intcon = intcon | (1 << pin);
            this.i2c.write(addr, [0x04 + port, intcon], this.timeout);
        } else if (trigger === this.triggerHigh) {
            defval = defval & ~(1 << pin);
            this.i2c.write(addr, [0x03 + port, defval], this.timeout);
            intcon = intcon | (1 << pin);
            this.i2c.write(addr, [0x04 + port, intcon], this.timeout);
        } else {
            print("Bad Trigger param");
            return false;
        }

        // GPIO Interrupt-on-change
        buffer = this.i2c.writeRead(addr, [0x02 + port], 1, this.timeout);
        if (buffer === undefined) {
            print("MCP23017:Err-IOC")
            return false;
        }
        let gpinten = Uint8Array(buffer)[0];
        gpinten = gpinten | (1 << pin);
        return this.i2c.write(addr, [0x02 + port, gpinten], this.timeout);
    },
    clearInterruptPin: function (pin) {
        let addr = this._getAddress();
        if (addr === -1 || pin < 0 || pin > 15) {
            return false;
        }
        let port = this.portA;
        if (pin >= 8) {
            port = this.portB;
            pin = pin - 8;
        }
        // current interrupt control register (1=DEFVAL, 0=previous pin value)
        let buffer = this.i2c.writeRead(addr, [0x04 + port], 1, this.timeout);
        if (buffer === undefined) {
            return false;
        }
        let intcon = Uint8Array(buffer)[0];
        intcon = intcon & ~(1 << pin);
        return this.i2c.write(addr, [0x04 + port, intcon], this.timeout);
    },
    getLastInterruptPin: function () {
        let addr = this._getAddress();
        if (addr === -1) {
            return -1;
        }
        let buffer = this.i2c.writeRead(addr, [0x07 + this.portA], 1, this.timeout);
        if (buffer === undefined) {
            return -1;
        }
        let data = Uint8Array(buffer)[0];
        if (data !== 0) {
            let pin = 0;
            while ((data & 0x01) === 0) {
                data = data >> 1;
                pin++;
            }
            return pin;
        }
        buffer = this.i2c.writeRead(addr, [0x07 + this.portB], 1, this.timeout);
        if (buffer === undefined) {
            return -1;
        }
        data = Uint8Array(buffer)[0];
        if (data !== 0) {
            let pin = 8;
            while ((data & 0x01) === 0) {
                data = data >> 1;
                pin++;
            }
            return pin;
        }

        return -1;
    },
    getCapturedInterruptValue: function () {
        let addr = this._getAddress();
        if (addr === -1) {
            return -1;
        }
        let buffer = this.i2c.writeRead(addr, [0x08 + this.portB], 2, this.timeout);
        if (buffer === undefined) {
            return -1;
        }
        let data = Uint8Array(buffer)[0] << 8;
        buffer = this.i2c.writeRead(addr, [0x08 + this.portA], 2, this.timeout);
        if (buffer === undefined) {
            return -1;
        }
        return data | (Uint8Array(buffer)[0]);
    },
});
