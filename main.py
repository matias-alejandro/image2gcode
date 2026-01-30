import cv2
from gcode import GCode, Feedrate, Unit
from scale import Scale

img = cv2.imread("silueta-avengers.jpg", cv2.IMREAD_GRAYSCALE)

_, thresh = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY_INV)

contours, _ = cv2.findContours(
    thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
)

scale = Scale(x=0.1, y=-0.1, z=0.1)
feedrate = Feedrate(x=700, y=700, z=200)

gc = GCode(Unit.MM)
gc.move_linear(z=5, feedrate=feedrate)

for contour in contours:
    x0, y0 = contour[0][0]
    gc.move_rapid(x=x0*scale.x, y=y0*scale.y)
    gc.move_linear(z=0, feedrate=feedrate)

    for point in contour:
        x, y = point[0]
        gc.move_linear(x=x*scale.x, y=y*scale.y, feedrate=feedrate)

    gc.move_rapid(x=x0*scale.x, y=y0*scale.y)

    gc.move_linear(z=5, feedrate=feedrate)

gc.save("output.gcode")
