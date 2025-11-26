#!/bin/bash

# Android Build Script for Global FinTech Mobile App
# This script builds the Android APK and AAB files

set -e

echo "================================"
echo "Global FinTech Android Builder"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo -e "${RED}✗ Flutter is not installed or not in PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Flutter found${NC}"
echo ""

# Navigate to mobile directory
cd "$(dirname "$0")/.." || exit

# Get Flutter version
FLUTTER_VERSION=$(flutter --version | head -n 1)
echo "Flutter Version: $FLUTTER_VERSION"
echo ""

# Clean previous builds
echo "Cleaning previous builds..."
flutter clean
echo -e "${GREEN}✓ Clean complete${NC}"
echo ""

# Get dependencies
echo "Getting dependencies..."
flutter pub get
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to get dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Run tests
echo "Running tests..."
flutter test
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠ Tests failed, but continuing build...${NC}"
fi
echo ""

# Build APK
echo "Building release APK..."
flutter build apk --release --split-per-abi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ APK build successful!${NC}"
    echo ""
    echo "APK locations:"
    echo "  • build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk"
    echo "  • build/app/outputs/flutter-apk/app-arm64-v8a-release.apk"
    echo "  • build/app/outputs/flutter-apk/app-x86_64-release.apk"
    echo ""

    # Create releases directory
    RELEASE_DIR="../../../releases/android"
    mkdir -p "$RELEASE_DIR"

    # Copy APKs to releases directory with timestamp
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    cp build/app/outputs/flutter-apk/app-arm64-v8a-release.apk "$RELEASE_DIR/global-fintech-arm64-$TIMESTAMP.apk"
    echo -e "${GREEN}✓ APK copied to $RELEASE_DIR${NC}"
    echo ""

    # Get file size
    SIZE=$(ls -lh "$RELEASE_DIR/global-fintech-arm64-$TIMESTAMP.apk" | awk '{print $5}')
    echo "File size: $SIZE"
    echo ""
else
    echo ""
    echo -e "${RED}✗ APK build failed!${NC}"
    exit 1
fi

# Build App Bundle (AAB) for Play Store
echo "Building release App Bundle (AAB)..."
flutter build appbundle --release

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ App Bundle build successful!${NC}"
    echo ""
    echo "AAB location:"
    echo "  • build/app/outputs/bundle/release/app-release.aab"
    echo ""

    # Copy AAB to releases directory
    cp build/app/outputs/bundle/release/app-release.aab "$RELEASE_DIR/global-fintech-$TIMESTAMP.aab"
    echo -e "${GREEN}✓ AAB copied to $RELEASE_DIR${NC}"
    echo ""

    # Get file size
    SIZE=$(ls -lh "$RELEASE_DIR/global-fintech-$TIMESTAMP.aab" | awk '{print $5}')
    echo "File size: $SIZE"
    echo ""
else
    echo ""
    echo -e "${RED}✗ App Bundle build failed!${NC}"
    exit 1
fi

echo "================================"
echo -e "${GREEN}Build Complete!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Install APK on device: adb install $RELEASE_DIR/global-fintech-arm64-$TIMESTAMP.apk"
echo "2. Upload AAB to Google Play Console for distribution"
echo ""
