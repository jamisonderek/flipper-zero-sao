#include <furi_hal.h>

#include "ws2812.h"
#include "led_driver.h"

struct Ws2812 {
    uint16_t num_leds;
    uint32_t* color;
    uint16_t brightness;
    LedDriver* led_driver;
};

/**
 * @brief Allocates a Ws2812 struct.
 * @details This method allocates a Ws2812 struct.  This is used to
 * control the addressable LEDs.
 * @param num_leds The number of LEDs to allocate.
 * @param leds_pin The GPIO pin to use for the LEDs. (&gpio_ext_pc3)
 * @return The allocated Ws2812 struct.
*/
Ws2812* ws2812_alloc(uint16_t num_leds, const GpioPin* const leds_pin) {
    Ws2812* leds = malloc(sizeof(Ws2812));
    leds->num_leds = num_leds;
    leds->color = malloc(sizeof(uint32_t) * leds->num_leds);
    leds->brightness = 255;
    leds->led_driver = led_driver_alloc(leds->num_leds, leds_pin);

    ws2812_reset(leds);
    return leds;
}

/**
 * @brief Frees a Ws2812 struct.
 * @param leds The Ws2812 struct to free.
*/
void ws2812_free(Ws2812* leds) {
    if(leds->led_driver) {
        led_driver_free(leds->led_driver);
    }
    free(leds->color);
    free(leds);
}

/**
 * @brief Resets the LEDs to their default color pattern (off).
 * @details This method resets the LEDs data to their default color pattern (off).
 * You must still call ws2812_update to update the LEDs.
 * @param leds The Ws2812 struct to reset.
*/
void ws2812_reset(Ws2812* leds) {
    for(int i = 0; i < leds->num_leds; i++) {
        leds->color[i] = 0x000000;
    }
}

/**
 * @brief Sets the color of the LEDs.
 * @details This method sets the color of the LEDs.
 * @param leds The Ws2812 struct to set the color of.
 * @param led The LED index to set the color of.
 * @param color The color to set the LED to (Hex value: RRGGBB).
 * @return True if the LED was set, false if the LED was out of range.
*/
bool ws2812_set(Ws2812* leds, uint16_t led, uint32_t color) {
    if(led > leds->num_leds) {
        return false;
    }

    leds->color[led] = color;
    return true;
}

/**
 * @brief Gets the color of the LEDs.
 * @details This method gets the color of the LEDs.
 * @param leds The Ws2812 struct to get the color of.
 * @param led The LED index to get the color of.
 * @return The color of the LED (Hex value: RRGGBB).
*/
uint32_t ws2812_get(Ws2812* leds, uint16_t led) {
    if(led > leds->num_leds) {
        return 0;
    }

    return leds->color[led];
}

/**
 * @brief Sets the brightness of the LEDs.
 * @details This method sets the brightness of the LEDs.
 * @param leds The Ws2812 struct to set the brightness of.
 * @param brightness The brightness to set the LEDs to (0-255).
*/
void ws2812_set_brightness(Ws2812* leds, uint8_t brightness) {
    leds->brightness = brightness;
}

/**
 * @brief Adjusts the brightness of a color.
 * @details This method adjusts the brightness of a color.
 * @param color The color to adjust.
 * @param brightness The brightness to adjust the color to (0-255).
 * @return The adjusted color.
*/
static uint32_t adjust_color_brightness(uint32_t color, uint8_t brightness) {
    uint32_t red = (color & 0xFF0000) >> 16;
    uint32_t green = (color & 0x00FF00) >> 8;
    uint32_t blue = (color & 0x0000FF);

    red = (red * brightness) / 255;
    green = (green * brightness) / 255;
    blue = (blue * brightness) / 255;

    return (red << 16) | (green << 8) | blue;
}

/**
 * @brief Updates the LEDs.
 * @details This method changes the LEDs to the colors set by ws2812_set.
 * @param leds The Ws2812 struct to update.
*/
void ws2812_update(Ws2812* leds) {
    for(int i = 0; i < leds->num_leds; i++) {
        uint32_t color = adjust_color_brightness(leds->color[i], leds->brightness);
        led_driver_set_led(leds->led_driver, i, color);
    }

    led_driver_transmit(leds->led_driver);
}
