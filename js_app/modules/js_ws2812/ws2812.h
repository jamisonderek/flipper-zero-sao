#pragma once

#include <furi_hal.h>

#define MAX_LED_COUNT 64

typedef struct Ws2812 Ws2812;

/**
 * @brief Allocates a Ws2812 struct.
 * @details This method allocates a Ws2812 struct.  This is used to
 * control the addressable LEDs.
 * @param num_leds The number of LEDs to allocate.
 * @param leds_pin The GPIO pin to use for the LEDs. (&gpio_ext_pc3)
 * @return The allocated Ws2812 struct.
*/
Ws2812* ws2812_alloc(uint16_t num_leds, const GpioPin* const leds_pin);

/**
 * @brief Frees a Ws2812 struct.
 * @param leds The Ws2812 struct to free.
*/
void ws2812_free(Ws2812* leds);

/**
 * @brief Resets the LEDs to their default color pattern (off).
 * @details This method resets the LEDs data to their default color pattern (off).
 * You must still call ws2812_update to update the LEDs.
 * @param leds The Ws2812 struct to reset.
*/
void ws2812_reset(Ws2812* leds);

/**
 * @brief Sets the color of the LEDs.
 * @details This method sets the color of the LEDs.
 * @param leds The Ws2812 struct to set the color of.
 * @param led The LED index to set the color of.
 * @param color The color to set the LED to (Hex value: RRGGBB).
 * @return True if the LED was set, false if the LED was out of range.
*/
bool ws2812_set(Ws2812* leds, uint16_t led, uint32_t color);

/**
 * @brief Gets the color of the LEDs.
 * @details This method gets the color of the LEDs.
 * @param leds The Ws2812 struct to get the color of.
 * @param led The LED index to get the color of.
 * @return The color of the LED (Hex value: RRGGBB).
*/
uint32_t ws2812_get(Ws2812* leds, uint16_t led);

/**
 * @brief Sets the brightness of the LEDs.
 * @details This method sets the brightness of the LEDs.
 * @param leds The Ws2812 struct to set the brightness of.
 * @param brightness The brightness to set the LEDs to (0-255).
*/
void ws2812_set_brightness(Ws2812* leds, uint8_t brightness);

/**
 * @brief Updates the LEDs.
 * @details This method changes the LEDs to the colors set by ws2812_set.
 * @param leds The Ws2812 struct to update.
*/
void ws2812_update(Ws2812* leds);
