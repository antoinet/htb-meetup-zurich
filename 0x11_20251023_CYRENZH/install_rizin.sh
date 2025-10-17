#!/bin/bash

set -e

echo "=== Rizin and Rizin Ghidra Plugin Installer ==="
echo

# Remove existing apt packages
echo "[1/6] Removing existing apt packages..."
sudo apt-get remove -y rizin rizin-plugin-ghidra 2>/dev/null || true
sudo apt-get autoremove -y

# Install build dependencies
echo "[2/6] Installing build dependencies..."
sudo apt-get update
sudo apt-get install -y git build-essential cmake meson

# Create build directory
BUILD_DIR="$HOME/rizin-build"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# Clone and build Rizin
echo "[3/6] Cloning Rizin repository..."
if [ -d "rizin" ]; then
    rm -rf rizin
fi
git clone https://github.com/rizinorg/rizin
cd rizin

echo "[4/6] Building and installing Rizin..."
meson setup build
meson compile -C build
sudo meson install -C build
sudo ldconfig

# Clone and build Rizin Ghidra plugin
echo "[5/6] Cloning Rizin Ghidra plugin repository..."
cd "$BUILD_DIR"
if [ -d "rz-ghidra" ]; then
    rm -rf rz-ghidra
fi
git clone --recursive https://github.com/rizinorg/rz-ghidra
cd rz-ghidra

echo "[6/6] Building and installing Rizin Ghidra plugin..."
mkdir build && cd build
cmake -DCMAKE_INSTALL_PREFIX=~/.local -DCMAKE_PREFIX_PATH=/usr/local ..
make -j 4
make install

# Verify installation
echo
echo "=== Installation Complete ==="
echo
echo "Rizin version:"
rizin -v
echo
echo "Installed plugins:"
rizin -c Lc -qq | grep ghidra || echo "Warning: Ghidra plugin not found in plugin list"

echo
echo "Installation finished successfully!"
echo "Build files are located in: $BUILD_DIR"
