#!/bin/bash

set -e
ROOT_DIR=$(pwd)

echo "> Starting packaging process..."

############# Python Backend #############
echo ">> Building Python backend..."

cd "$ROOT_DIR/backend"
if [ ! -d "env" ]; then
    python3 -m venv env
    ./env/bin/pip install -r requirements.txt
fi
./env/bin/pyinstaller --onefile --name main main.py --clean

echo ">> Python backend built in ./dist/main"

if [ ! -f "./dist/main" ]; then
    echo ">> [Error]: Python backend not built"
    exit 1
fi

cd "$ROOT_DIR"

############# GUI #############
echo ">> Building GUI..."

npm install
npm run build

if [ ! -d "dist" ]; then
    echo ">> [Error]: GUI not built"
    exit 1
fi

############# AppImage #############
echo ">> Creating AppImage..."
npm run dist

APPIMAGE_PATH=$(find release -name "*.AppImage" | head -n 1)
if [ -f "$APPIMAGE_PATH" ]; then
    echo ">> AppImage created successfully: $APPIMAGE_PATH"
    
    echo ">> Cleaning up temporary files..."
    rm -rf dist
    rm -rf build/main
    rm -f main.spec
else
    echo ">> [Error]: AppImage not built"
    exit 1
fi
