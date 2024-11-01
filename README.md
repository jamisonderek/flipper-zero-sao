# flipper-zero-sao

## Description
This project is for using the Flipper Zero to debug [SAO devices](https://hackaday.io/search?term=SAO). We use JavaScript on the Flipper Zero to interact with the various SAO devices. JavaScript is 500-800 times slower than C, but it has the advantage that we can update our script without needing a computer to compile our code!

You can update scripts using a bluetooth connected mobile phone (run the Flipper Zero [mobile app](https://flipperzero.one/downloads) and choose `Options/File Manager/ext/apps/Scripts/SAO`), or using a text editor directly on the Flipper Zero. This is especially useful for quickly iterating or making minor tweaks to existing scripts.

Hopefully by November 3rd, I'll have directions for using the **BadgeLife SAO Debug Tool** from [Thomas Flummer](https://hackaday.io/tf)!  I think that likely we will just need a jumper between pin 3 and pin 5 on the board that connects to the Flipper Zero.  I'll update this README with more information as soon as I have it!

## Features
- I2C
  - Connect SDA to Flipper pin 15
  - Connect SCL to Flipper pin 16
- SPI OUTPUT
  - Connect USER1 (aka GPIO1) to Flipper pin 2 (aka MOSI)
  - Connect USER2 (aka GPIO2) to Flipper pin 5 (aka SCK)
- GPIO
  - Connect USER1 (aka GPIO1) to Flipper pin 2
  - Connect USER2 (aka GPIO2) to Flipper pin 5

Supported modules:
- AT24C32 - 32K I2C EEPROM
- MCP23017 - 16-bit GPIO expander
- SK9822 - Addressable RGB LEDs
- WS2812B - Addressable RGB LEDs (required rebuulding the firmware)

Future modules:
- SSD1306 - OLED display (under development)
- LPUART
  - Not encouraged, multiple SAO may have issue.
  - Uses same pins as I2C

## Installation
- Install the latest dev branch of [Momentum firmware](https://momentum-fw.dev/update/).
- Copy the [SAO](./js_app/examples/apps/Scripts/) folder to your Flipper Zero (e.g. `SD Card/apps/Scripts` folder).
- NOTE: For controlling WS2812B you will need to build custom Momentum firmware. I hope to submit a PR to Momentum in late November 2024, so that you won't have to do this step. Please see the [custom firmware](#custom-firmware) section below!

## Running Samples
- [sao_at24_w_sao69.js](./js_app/examples/apps/Scripts/SAO/sao_at24_w_sao69.js) - Program the AT24C32 EEPROM with a SAO.69 formatted message.
- [sao_at24_w_life.js](./js_app/examples/apps/Scripts/SAO/sao_at24_w_life.js) - Program the AT24C32 EEPROM with a [Badge.team LIFE](https://badge.team/docs/standards/sao/binary_descriptor/) formatted message.
- [sao_at24_read.js](./js_app/examples/apps/Scripts/SAO/sao_at24_read.js) - Read the AT24C32 EEPROM.
- [sao_sk9822.js](./js_app/examples/apps/Scripts/SAO/sao_sk9822.js) - Control SK9822 RGB LEDs.
- [sao_mcp_out.js](./js_app/examples/apps/Scripts/SAO/sao_mcp_out.js) - Control a MCP23017 GPIO expander (Blinks GPIOA0-GPIOA5).
- [sao_mcp_matrix.js](./js_app/examples/apps/Scripts/SAO/sao_mcp_matrix.js) - Control a MCP23017 GPIO expander (Input using a 4x4 button matrix on GPIOB0-7).
- [sao_ws2812b.js](./js_app/examples/apps/Scripts/SAO/sao_ws2812b.js) - Control WS2812B RGB LEDs. Currently requires [custom firmware](#custom-firmware).

## Custom Firmware
**NOTE: These steps are only required if you want to control WS2812B RGB LEDs!**

First clone and build the Momentum firmware:

_(NOTE: If you are running a Windows Command Prompt, use `fbt` instead of `./fbt`)_

```bash
git clone --recursive https://github.com/next-Flip/Momentum-Firmware.git
cd Momentum-Firmware
./fbt vscode_dist
./fbt updater_package
```

Next, overlay the files from the [js_app](./js_app/) folder in this repository to the Momentum firmware files in the `applications/system/js_app` folder.

Make sure your Flipper Zero is plugged in to your computer, and that qFlipper and lab.flipper.net are not running. Then the following command to build and deploy the firmware to your Flipper Zero:

```bash
./fbt COMPACT=1 DEBUG=0 FORCE=1 flash_usb_full 
```