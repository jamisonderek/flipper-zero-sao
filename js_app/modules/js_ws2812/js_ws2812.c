#include "../../js_modules.h"
#include <core/common_defines.h>
#include <furi_hal_gpio.h>
#include <furi_hal_resources.h>

#include "ws2812.h"

typedef struct {
    Ws2812* leds;
} JsWs2812Inst;

static void js_ws2812_setup(struct mjs* mjs) {
    mjs_val_t obj_inst = mjs_get(mjs, mjs_get_this(mjs), INST_PROP_NAME, ~0);
    JsWs2812Inst* ws2812 = mjs_get_ptr(mjs, obj_inst);
    furi_assert(ws2812);

    mjs_val_t setup_arg;
    JS_FETCH_ARGS_OR_RETURN(mjs, JS_EXACTLY, JS_ARG_OBJ(&setup_arg));
    mjs_val_t pin_obj = mjs_get(mjs, setup_arg, "pin", ~0);
    mjs_val_t count_obj = mjs_get(mjs, setup_arg, "count", ~0);

    if(!mjs_is_number(count_obj)) {
        JS_ERROR_AND_RETURN(mjs, MJS_BAD_ARGS_ERROR, "count must be a number");
    }

    const GpioPinRecord* pin_record = NULL;
    // parse input argument to a pin pointer
    const char* name_string = mjs_get_string(mjs, &pin_obj, NULL);
    if(name_string) {
        pin_record = furi_hal_resources_pin_by_name(name_string);
    } else if(mjs_is_number(pin_obj)) {
        int name_int = mjs_get_int(mjs, pin_obj);
        pin_record = furi_hal_resources_pin_by_number(name_int);
    } else {
        JS_ERROR_AND_RETURN(mjs, MJS_BAD_ARGS_ERROR, "Pin must be either a string or a number");
    }

    if(!pin_record) JS_ERROR_AND_RETURN(mjs, MJS_BAD_ARGS_ERROR, "Pin not found on device");
    if(pin_record->debug) {
        JS_ERROR_AND_RETURN(mjs, MJS_BAD_ARGS_ERROR, "Pin is used for debugging");
    }

    uint16_t count = mjs_get_int(mjs, count_obj);
    if(count == 0 || count > MAX_LED_COUNT) {
        JS_ERROR_AND_RETURN(mjs, MJS_BAD_ARGS_ERROR, "invalid count");
    }

    if(ws2812->leds) {
        ws2812_free(ws2812->leds);
    }

    ws2812->leds = ws2812_alloc(count, pin_record->pin);
}

static void js_ws2812_set(struct mjs* mjs) {
    mjs_val_t obj_inst = mjs_get(mjs, mjs_get_this(mjs), INST_PROP_NAME, ~0);
    JsWs2812Inst* ws2812 = mjs_get_ptr(mjs, obj_inst);
    furi_assert(ws2812);

    if(!ws2812->leds) {
        JS_ERROR_AND_RETURN(mjs, MJS_INTERNAL_ERROR, "LEDs not setup");
    }

    uint32_t color;
    if(mjs_nargs(mjs) == 2) {
        if(mjs_is_number(mjs_arg(mjs, 0)) && mjs_is_number(mjs_arg(mjs, 1))) {
            color = mjs_get_int(mjs, mjs_arg(mjs, 1));
        } else if(mjs_is_number(mjs_arg(mjs, 0)) && mjs_is_object(mjs_arg(mjs, 1))) {
            mjs_val_t red_obj = mjs_get(mjs, mjs_arg(mjs, 1), "red", ~0);
            mjs_val_t green_obj = mjs_get(mjs, mjs_arg(mjs, 1), "green", ~0);
            mjs_val_t blue_obj = mjs_get(mjs, mjs_arg(mjs, 1), "blue", ~0);
            if(!mjs_is_number(red_obj) || !mjs_is_number(green_obj) || !mjs_is_number(blue_obj)) {
                JS_ERROR_AND_RETURN(mjs, MJS_BAD_ARGS_ERROR, "red,green,blue must be numbers");
            }
            color = ((mjs_get_int(mjs, red_obj) & 0xFF) << 16) |
                    ((mjs_get_int(mjs, green_obj) & 0xFF) << 8) |
                    (mjs_get_int(mjs, blue_obj) & 0xFF);
        } else {
            JS_ERROR_AND_RETURN(
                mjs, MJS_BAD_ARGS_ERROR, "use (pin,{red,green,blue}) or (pin,r,g,b)");
        }
    } else if(mjs_nargs(mjs) == 4) {
        if(!mjs_is_number(mjs_arg(mjs, 0)) || !mjs_is_number(mjs_arg(mjs, 1)) ||
           !mjs_is_number(mjs_arg(mjs, 2)) || !mjs_is_number(mjs_arg(mjs, 3))) {
            JS_ERROR_AND_RETURN(mjs, MJS_BAD_ARGS_ERROR, "pin,r,g,b must be numbers");
        }

        color = ((mjs_get_int(mjs, mjs_arg(mjs, 1)) & 0xFF) << 16) |
                ((mjs_get_int(mjs, mjs_arg(mjs, 2)) & 0xFF) << 8) |
                (mjs_get_int(mjs, mjs_arg(mjs, 3) & 0xFF));
    } else {
        JS_ERROR_AND_RETURN(mjs, MJS_BAD_ARGS_ERROR, "use (pin,r,g,b) or (pin,{red,green,blue})");
    }

    uint16_t index = mjs_get_int(mjs, mjs_arg(mjs, 0));

    uint16_t original_color = ws2812_get(ws2812->leds, index);
    ws2812_set(ws2812->leds, index, color);
    mjs_return(mjs, mjs_mk_number(mjs, original_color));
}

static void js_ws2812_get_value(struct mjs* mjs) {
    mjs_val_t obj_inst = mjs_get(mjs, mjs_get_this(mjs), INST_PROP_NAME, ~0);
    JsWs2812Inst* ws2812 = mjs_get_ptr(mjs, obj_inst);
    furi_assert(ws2812);

    if(!ws2812->leds) {
        JS_ERROR_AND_RETURN(mjs, MJS_INTERNAL_ERROR, "LEDs not setup");
    }

    if(mjs_nargs(mjs) != 1 || !mjs_is_number(mjs_arg(mjs, 0))) {
        JS_ERROR_AND_RETURN(mjs, MJS_BAD_ARGS_ERROR, "pin must be a number");
    }

    uint16_t index = mjs_get_int(mjs, mjs_arg(mjs, 0));
    mjs_return(mjs, mjs_mk_number(mjs, ws2812_get(ws2812->leds, index)));
}

static void js_ws2812_get_color(struct mjs* mjs) {
    mjs_val_t obj_inst = mjs_get(mjs, mjs_get_this(mjs), INST_PROP_NAME, ~0);
    JsWs2812Inst* ws2812 = mjs_get_ptr(mjs, obj_inst);
    furi_assert(ws2812);

    if(!ws2812->leds) {
        JS_ERROR_AND_RETURN(mjs, MJS_INTERNAL_ERROR, "LEDs not setup");
    }

    if(mjs_nargs(mjs) != 1 || !mjs_is_number(mjs_arg(mjs, 0))) {
        JS_ERROR_AND_RETURN(mjs, MJS_BAD_ARGS_ERROR, "pin must be a number");
    }

    uint16_t index = mjs_get_int(mjs, mjs_arg(mjs, 0));
    uint32_t color = ws2812_get(ws2812->leds, index);

    mjs_val_t color_obj = mjs_mk_object(mjs);
    JS_ASSIGN_MULTI(mjs, color_obj) {
        JS_FIELD("red", mjs_mk_number(mjs, (color >> 16) & 0xFF));
        JS_FIELD("green", mjs_mk_number(mjs, (color >> 8) & 0xFF));
        JS_FIELD("blue", mjs_mk_number(mjs, color & 0xFF));
    }
    mjs_return(mjs, color_obj);
}

static void js_ws2812_update(struct mjs* mjs) {
    mjs_val_t obj_inst = mjs_get(mjs, mjs_get_this(mjs), INST_PROP_NAME, ~0);
    JsWs2812Inst* ws2812 = mjs_get_ptr(mjs, obj_inst);
    furi_assert(ws2812);

    if(!ws2812->leds) {
        JS_ERROR_AND_RETURN(mjs, MJS_INTERNAL_ERROR, "LEDs not setup");
    }

    ws2812_update(ws2812->leds);
}

static void* js_ws2812_create(struct mjs* mjs, mjs_val_t* object, JsModules* modules) {
    UNUSED(modules);
    JsWs2812Inst* ws2812 = malloc(sizeof(JsWs2812Inst));
    ws2812->leds = NULL;
    mjs_val_t ws2812_obj = mjs_mk_object(mjs);
    mjs_set(mjs, ws2812_obj, INST_PROP_NAME, ~0, mjs_mk_foreign(mjs, ws2812));
    mjs_set(mjs, ws2812_obj, "setup", ~0, MJS_MK_FN(js_ws2812_setup));
    mjs_set(mjs, ws2812_obj, "set", ~0, MJS_MK_FN(js_ws2812_set));
    mjs_set(mjs, ws2812_obj, "getValue", ~0, MJS_MK_FN(js_ws2812_get_value));
    mjs_set(mjs, ws2812_obj, "getColor", ~0, MJS_MK_FN(js_ws2812_get_color));
    mjs_set(mjs, ws2812_obj, "update", ~0, MJS_MK_FN(js_ws2812_update));
    *object = ws2812_obj;
    return ws2812;
}

static void js_ws2812_destroy(void* inst) {
    JsWs2812Inst* ws2812 = inst;
    if(ws2812->leds) {
        ws2812_free(ws2812->leds);
    }
    free(ws2812);
}

static const JsModuleDescriptor js_ws2812_desc = {
    "ws2812",
    js_ws2812_create,
    js_ws2812_destroy,
    NULL,
};

static const FlipperAppPluginDescriptor plugin_descriptor = {
    .appid = PLUGIN_APP_ID,
    .ep_api_version = PLUGIN_API_VERSION,
    .entry_point = &js_ws2812_desc,
};

const FlipperAppPluginDescriptor* js_ws2812_ep(void) {
    return &plugin_descriptor;
}
