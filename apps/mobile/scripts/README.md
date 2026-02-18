# Mobile App Build Scripts

This directory contains automated build scripts for generating Android and iOS builds of the Global FinTech mobile application.

## Available Scripts

### `build-android.sh`

Builds Android APK and AAB (App Bundle) files.

**Features:**
- Cleans previous builds
- Installs dependencies
- Runs tests (optional failure)
- Builds split APKs for different architectures
- Builds App Bundle for Google Play Store
- Copies builds to releases directory with timestamp
- Shows file sizes

**Usage:**
```bash
cd apps/mobile
./scripts/build-android.sh
```

**Output:**
- `releases/android/global-fintech-arm64-TIMESTAMP.apk` - ARM64 APK
- `releases/android/global-fintech-TIMESTAMP.aab` - App Bundle for Play Store

**Requirements:**
- Flutter SDK installed
- Android SDK configured
- Java 11+ installed

### `build-ios.sh`

Builds iOS app for archiving and IPA generation.

**Features:**
- Checks for macOS environment
- Validates Xcode and CocoaPods installation
- Cleans previous builds
- Installs dependencies
- Runs CocoaPods install
- Builds release iOS app
- Optionally opens Xcode for archiving

**Usage:**
```bash
cd apps/mobile
./scripts/build-ios.sh
```

**Output:**
- `ios/build/ios/Release-iphoneos/Runner.app` - iOS app
- Opens Xcode for manual archiving and IPA export

**Requirements:**
- macOS
- Xcode installed
- CocoaPods installed
- Valid signing certificates
- Provisioning profiles configured

## Quick Start

### Android Build

```bash
# Navigate to mobile directory
cd apps/mobile

# Run Android build script
./scripts/build-android.sh

# Install on device
adb install releases/android/global-fintech-arm64-*.apk
```

### iOS Build

```bash
# Navigate to mobile directory
cd apps/mobile

# Run iOS build script
./scripts/build-ios.sh

# Follow on-screen instructions to:
# 1. Archive in Xcode
# 2. Export IPA
# 3. Distribute via TestFlight or App Store
```

## Build Variants

### Development Build

```bash
# Android
flutter build apk --debug

# iOS
flutter build ios --debug --no-codesign
```

### Release Build (Scripts)

```bash
# Android
./scripts/build-android.sh

# iOS
./scripts/build-ios.sh
```

### Specific Architecture

```bash
# Android ARM64 only
flutter build apk --target-platform android-arm64 --release

# Android x86 (emulator)
flutter build apk --target-platform android-x86 --release
```

## Build Outputs

### Android

```
releases/android/
├── global-fintech-arm64-20251126-120000.apk  # ARM64 devices
├── global-fintech-20251126-120000.aab         # Play Store bundle
```

### iOS

```
releases/ios/
├── global-fintech-20251126-120000.ipa         # Exported IPA
```

## Troubleshooting

### Android

**Gradle build fails:**
```bash
cd apps/mobile/android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

**Keystore issues:**
- Verify `android/key.properties` file exists
- Check keystore path and passwords
- Ensure keystore file is accessible

### iOS

**CocoaPods errors:**
```bash
cd apps/mobile/ios
pod deintegrate
pod repo update
pod install
cd ..
flutter clean
```

**Signing errors:**
- Open `ios/Runner.xcworkspace` in Xcode
- Check signing configuration
- Verify development team
- Update provisioning profiles

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:

### GitHub Actions

See `.github/workflows/build-android.yml` and `.github/workflows/build-ios.yml` for automated build workflows.

### Manual Release

1. Run build script
2. Test on physical device
3. Upload to distribution platform:
   - Android: Google Play Console
   - iOS: App Store Connect via TestFlight

## Version Management

Update version before building:

1. Edit `pubspec.yaml`:
   ```yaml
   version: 1.0.0+1  # version+buildNumber
   ```

2. Increment build number for each release:
   ```yaml
   version: 1.0.1+2
   version: 1.1.0+3
   ```

## Build Checklist

Before running build scripts:

- [ ] Update version in `pubspec.yaml`
- [ ] All tests passing
- [ ] API endpoints configured for production
- [ ] Debug logs disabled
- [ ] App icons added
- [ ] Splash screen configured
- [ ] Privacy policy URL set
- [ ] Signing configured (Android keystore / iOS certificates)

## Support

For build issues:
- Check Flutter: `flutter doctor -v`
- View build guide: [BUILD_GUIDE.md](../BUILD_GUIDE.md)
- Report issues: [GitHub Issues](https://github.com/yourusername/Global-FinTech/issues)

---

**Last Updated**: November 26, 2025
