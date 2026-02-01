import sys
from gcode import GCode, Feedrate
from tools import Scale, ImageReader

if len(sys.argv) < 2:
    print("Usage: python main.py <image_file>")
    sys.exit(1)

reader = ImageReader(filename=sys.argv[1])
try:
    contours = reader.get_contours()
except Exception as e:
    print(f"Error reading image: {e}")
    sys.exit(1)

scale = Scale(x=0.1, y=-0.1, z=0.1)
horizontal_feedrate = Feedrate(700)
vertical_feedrate = Feedrate(200)

gc = GCode()
gc.move_linear(z=5, feedrate=vertical_feedrate)

for contour in contours:
    if len(contour) == 0: continue
    
    x0, y0 = contour[0][0]
    gc.move_rapid(x=x0*scale.x, y=y0*scale.y)
    gc.move_linear(z=0, feedrate=vertical_feedrate)

    for point in contour:
        x, y = point[0]
        gc.move_linear(x=x*scale.x, y=y*scale.y, feedrate=horizontal_feedrate)

    gc.move_rapid(x=x0*scale.x, y=y0*scale.y)
    gc.move_linear(z=5, feedrate=vertical_feedrate)

output_filename = sys.argv[1].rsplit(".", 1)[0] + ".gcode"
gc.save(output_filename)
