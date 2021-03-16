from luma.core.interface.serial import i2c, spi, pcf8574
from luma.core.interface.parallel import bitbang_6800
from luma.core.render import canvas
from luma.oled.device import ssd1306, ssd1309, ssd1325, ssd1331, sh1106, ws0010
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import time
import textwrap
import sys
import json

def do_nothing(obj):
  pass

# rev.1 users set port=0
# substitute spi(device=0, port=0) below if using that interface
# substitute bitbang_6800(RS=7, E=8, PINS=[25,24,23,27]) below if using that interface
serial = i2c(port=1, address=0x3C)

# substitute ssd1331(...) or sh1106(...) below if using that device
device = sh1106(serial)

# ne cisti posle zavrsetka skripte
device.cleanup = do_nothing

#font = ImageFont.truetype("courier-prime.regular.ttf", 11);
font = ImageFont.truetype("SourceCodePro-Regular.ttf", 14);

#def drawText():
#text = json.loads(sys.stdion.readlines()[0])
with canvas(device) as draw:
  #draw.rectangle(device.bounding_box, outline="white", fill="black")
  text = sys.argv[1]
  margin = 0
  offset = 0
  for line in textwrap.wrap(text, width=16):
    draw.text((margin, offset), line, font=font, fill="white")
    offset += 12

#if __name__ == '__main__':
#  drawText()
