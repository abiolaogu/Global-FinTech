#!/bin/bash

# iOS Build Script for Global FinTech Mobile App
# This script builds the iOS app for archiving and IPA generation

set -e

echo "================================"
echo "Global FinTech iOS Builder"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0;29m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}✗ iOS builds require macOS${NC}"
    exit 1
fi

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo -e "${RED}✗ Flutter is not installed or not in PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Flutter found${NC}"
echo ""

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}✗ Xcode is not installed${NC}"
    echo "Install Xcode from the Mac App Store"
    exit 1
fi

echo -e "${GREEN}✓ Xcode found${NC}"
echo ""

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo -e "${RED}✗ CocoaPods is not installed${NC}"
    echo "Install with: sudo gem install cocoapods"
    exit 1
fi

echo -e "${GREEN}✓ CocoaPods found${NC}"
echo ""

# Navigate to mobile directory
cd "$(dirname "$0")/.." || exit

# Get Flutter version
FLUTTER_VERSION=$(flutter --version | head -n 1)
echo "Flutter Version: $FLUTTER_VERSION"
echo ""

# Get Xcode version
XCODE_VERSION=$(xcodebuild -version | head -n 1)
echo "Xcode Version: $XCODE_VERSION"
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

# Install CocoaPods dependencies
echo "Installing iOS dependencies..."
cd ios || exit
pod install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install CocoaPods dependencies${NC}"
    echo "Try running: pod repo update && pod install"
    exit 1
fi
cd ..
echo -e "${GREEN}✓ iOS dependencies installed${NC}"
echo ""

# Run tests
echo "Running tests..."
flutter test
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠ Tests failed, but continuing build...${NC}"
fi
echo ""

# Build iOS
echo "Building release iOS app..."
flutter build ios --release

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ iOS build successful!${NC}"
    echo ""
    echo "Build location:"
    echo "  • ios/build/ios/Release-iphoneos/Runner.app"
    echo ""

    # Create releases directory
    RELEASE_DIR="../../../releases/ios"
    mkdir -p "$RELEASE_DIR"

    echo ""
    echo "================================"
    echo -e "${GREEN}Build Complete!${NC}"
    echo "================================"
    echo ""
    echo "Next steps to create IPA:"
    echo ""
    echo "1. Open Xcode workspace:"
    echo "   open ios/Runner.xcworkspace"
    echo ""
    echo "2. In Xcode:"
    echo "   • Select 'Any iOS Device' as target"
    echo "   • Product > Archive"
    echo "   • When archive completes, select it"
    echo "   • Click 'Distribute App'"
    echo ""
    echo "3. Distribution options:"
    echo "   • Ad Hoc: For testing on registered devices"
    echo "   • App Store: For App Store submission"
    echo "   • Enterprise: For internal distribution"
    echo "   • Development: For testing on your devices"
    echo ""
    echo "4. Export IPA to: $RELEASE_DIR"
    echo ""

    # Optionally open Xcode automatically
    read -p "Open Xcode workspace now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open ios/Runner.xcworkspace
    fi
else
    echo ""
    echo -e "${RED}✗ iOS build failed!${NC}"
    echo ""
    echo "Common issues:"
    echo "1. Check signing configuration in Xcode"
    echo "2. Verify development team is set"
    echo "3. Check provisioning profiles"
    echo "4. Run: pod repo update && pod install"
    echo ""
    exit 1
fi
