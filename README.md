# Image2GCode
![image2gcode](build/icon.png)

[English](README.md) | [Español](README.es.md)

**Image2GCode** is a simple and user-friendly tool designed to convert images into G-Code, optimized for plotters and CNC machines.


![Versión](https://img.shields.io/badge/version-1.1.1-green.svg)

## Screenshot

![Image2GCode screenshot](screenshot.png)

## Dev

**Backend (Python)**:
```bash
cd backend
python3 -m venv env
source env/bin/activate  
pip install -r requirements.txt
```

**Frontend (Node.js)**:
```bash
cd ..
npm install
```

**Run**:
```bash
npm run dev
```

## Package
Generates the AppImage in the `release` folder

```bash
chmod +x package.sh
./package.sh
```
