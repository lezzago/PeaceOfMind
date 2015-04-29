// #pragma once
#include <pebble.h>
#include "cautionary.h"
#include "emergency_conf.h"
#include "main.h"
#include "followed.h"
#include "appmessage.h"
// #include "emergency.c"
// #include "emergency_conf.c"
 
static Window* window;
static MenuLayer *menu_layer;



void caution_draw_row_callback(GContext *ctx, Layer *cell_layer, MenuIndex *cell_index, void *callback_context)
{
  switch(cell_index->row)
    {
    case 0:
        menu_cell_basic_draw(ctx, cell_layer, "I am Safe", NULL, NULL);
        break;
    case 1:
        menu_cell_basic_draw(ctx, cell_layer, "Might Be Followed", NULL, NULL);
        break;
    case 2:
        menu_cell_basic_draw(ctx, cell_layer, "Call 911", "Send GPS to Police", NULL);
        break;
    }
}


 uint16_t caution_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *callback_context)
 {
   return 3;
 }

void caution_select_click_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *callback_context)
{
  switch(cell_index->row)
   {
     case 0:
      send_int(0);
      init();
      //remove this window frmo the stack
      window_stack_remove(window, false);
      break;
    case 1:
      send_int(2);
      followed_init();
      //remove this window frmo the stack
      window_stack_remove(window, false);
      break;
    case 2:
      send_int(3);
      emergency_conf_init();
      //remove this window frmo the stack
      window_stack_remove(window, false);
      break;
   }
}



 

void caution_window_load(Window *window)
{
  //Create it - 12 is approx height of the top bar
  menu_layer = menu_layer_create(GRect(0, 0, 144, 168 - 16));

  //Let it receive clicks
  //menu_layer_set_click_config_onto_window(menu_layer, window);

  //Give it its callbacks
  MenuLayerCallbacks callbacks = {
    .draw_row = (MenuLayerDrawRowCallback) caution_draw_row_callback,
    .get_num_rows = (MenuLayerGetNumberOfRowsInSectionsCallback) caution_num_rows_callback,
    .select_click = (MenuLayerSelectCallback) caution_select_click_callback
  };
  menu_layer_set_callbacks(menu_layer, NULL, callbacks);

  //Add to Window
  layer_add_child(window_get_root_layer(window), menu_layer_get_layer(menu_layer));

}

void caution_window_unload(Window *window)
{
  menu_layer_destroy(menu_layer);

}

void caution_upClickHandler(ClickRecognizerRef recognizer, void *context) {
  menu_layer_set_selected_next(menu_layer, true, MenuRowAlignCenter, false);
}

void caution_downClickHandler(ClickRecognizerRef recognizer, void *context) {
  menu_layer_set_selected_next(menu_layer, false, MenuRowAlignCenter, false);
}

void caution_selectClickHandler(ClickRecognizerRef recognizer, void *context) {
  MenuIndex index = menu_layer_get_selected_index(menu_layer);
  caution_select_click_callback(menu_layer, &index, NULL);
}

void caution_click_config_provider(ClickRecognizerRef recognizer, void *context) {
  window_single_click_subscribe(BUTTON_ID_BACK, NULL);
  window_single_click_subscribe(BUTTON_ID_UP, caution_upClickHandler);
  window_single_click_subscribe(BUTTON_ID_DOWN, caution_downClickHandler);
  window_single_click_subscribe(BUTTON_ID_SELECT, caution_selectClickHandler);
}
  
void caution_init()
{
    window = window_create();
    WindowHandlers handlers = {
        .load = caution_window_load,
        .unload = caution_window_unload
    };
    window_set_window_handlers(window, (WindowHandlers) handlers);
    window_set_click_config_provider(window, (ClickConfigProvider) caution_click_config_provider);
  
    window_stack_push(window, true);
}
 
void caution_deinit()
{
    window_destroy(window);
}
 

