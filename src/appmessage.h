#pragma once
#include "pebble.h"
  
enum{
  STATUS = 0
};

void appmessage_init(void);

void send_int(uint8_t val);