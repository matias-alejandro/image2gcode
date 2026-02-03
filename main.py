from flask import Flask, request, jsonify
from flask_cors import CORS
from gcode import GCode, Feedrate
from tools import Scale, ImageReader
import os

app = Flask(__name__)
CORS(app)

def process_image(image_path):
    reader = ImageReader(filename=image_path)
    contours = reader.get_contours()

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

        gc.move_linear(x=x0*scale.x, y=y0*scale.y, feedrate=horizontal_feedrate)
        gc.move_linear(z=5, feedrate=vertical_feedrate)

    return "\n".join(gc.commands)

@app.route('/convert', methods=['POST'])
def convert():
    data = request.json
    image_path = data.get('image_path')
    
    if not image_path:
        return jsonify({"error": "No image path provided"}), 400
    
    if not os.path.exists(image_path):
        return jsonify({"error": f"File not found: {image_path}"}), 404
    
    try:
        gcode = process_image(image_path)
        return jsonify({
            "message": "Conversion successful",
            "gcode": gcode
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
