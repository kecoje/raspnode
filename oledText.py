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

serial = i2c(port=1, address=0x3C)
device = sh1106(serial)
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
