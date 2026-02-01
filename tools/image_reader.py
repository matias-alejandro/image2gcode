import cv2
import numpy as np

try:
    from svgpathtools import svg2paths
except ImportError:
    svg2paths = None

class ImageReader:
    def __init__(self, filename):
        self.filename = filename

    def get_contours(self):
        if self.filename.lower().endswith('.svg'):
            return self._read_svg()
        else:
            return self._read_raster()

    def _read_raster(self):
        img = cv2.imread(self.filename, cv2.IMREAD_UNCHANGED)
        if img is None:
            raise ValueError(f"Could not read image: {self.filename}")

        if img.ndim == 3 and img.shape[2] == 4:
            alpha = img[:, :, 3] / 255.0
            img = img[:, :, :3] * alpha[:, :, None] + 255 * (1 - alpha[:, :, None])
            img = img.astype(np.uint8)

        if img.ndim == 3:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        _, thresh = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY_INV)

        contours, _ = cv2.findContours(
            thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        return contours

    def _read_svg(self):
        if svg2paths is None:
             raise ImportError("svgpathtools is not installed. Please install it with 'pip install svgpathtools'")
        
        paths, attributes = svg2paths(self.filename)
        contours = []
        
        for path in paths:
            if path.length() == 0:
                continue
            
            length = path.length()
            num_points = int(length) 
            if num_points < 10: num_points = 10 
            
            ts = np.linspace(0, 1, num_points)
            
            contour_points = []
            for t in ts:
                point = path.point(t)
                contour_points.append([[point.real, point.imag]])
            
            contours.append(np.array(contour_points, dtype=np.float32))
            
        return contours
