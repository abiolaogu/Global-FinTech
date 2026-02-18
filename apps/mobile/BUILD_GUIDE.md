# Mobile App Build Guide

This guide provides step-by-step instructions for building Android (APK/AAB) and iOS (IPA) versions of the Global FinTech mobile application.

## Prerequisites

### Required Software

- **Flutter SDK**: 3.0.0 or higher
- **Dart SDK**: 2.17.0 or higher (comes with Flutter)
- **Android Studio**: For Android builds
- **Xcode**: For iOS builds (macOS only)
- **CocoaPods**: For iOS dependencies (macOS only)

### Installation

1. **Install Flutter**
   ```bash
   # Download Flutter
   git clone https://github.com/flutter/flutter.git -b stable
   export PATH="$PATH:`pwd`/flutter/bin"

   # Verify installation
   flutter doctor
   ```

2. **Install Android Studio** (for Android builds)
   - Download from https://developer.android.com/studio
   - Install Android SDK
   - Accept Android licenses:
     ```bash
     flutter doctor --android-licenses
     ```

3. **Install Xcode** (for iOS builds, macOS only)
   - Download from Mac App Store
   - Install command line tools:
     ```bash
     sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
     sudo xcodebuild -runFirstLaunch
     ```

4. **Install CocoaPods** (for iOS builds, macOS only)
   ```bash
   sudo gem install cocoapods
   ```

## Project Setup

1. **Navigate to mobile app directory**
   ```bash
   cd apps/mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Verify setup**
   ```bash
   flutter doctor
   ```

   Ensure all checkmarks are green for your target platforms.

## Building for Android

### Debug Build (APK)

1. **Build debug APK**
   ```bash
   flutter build apk --debug
   ```

2. **Output location**
   ```
   build/app/outputs/flutter-apk/app-debug.apk
   ```

### Release Build (APK)

1. **Create keystore for signing** (first time only)
   ```bash
   keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```

2. **Create key.properties file**
   ```bash
   # Create android/key.properties
   storePassword=<password>
   keyPassword=<password>
   keyAlias=upload
   storeFile=<path-to-keystore>/upload-keystore.jks
   ```

3. **Update android/app/build.gradle**
   ```gradle
   def keystoreProperties = new Properties()
   def keystorePropertiesFile = rootProject.file('key.properties')
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }

   android {
       ...
       signingConfigs {
           release {
               keyAlias keystoreProperties['keyAlias']
               keyPassword keystoreProperties['keyPassword']
               storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
               storePassword keystoreProperties['storePassword']
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

4. **Build release APK**
   ```bash
   flutter build apk --release
   ```

5. **Output location**
   ```
   build/app/outputs/flutter-apk/app-release.apk
   ```

### App Bundle (AAB) for Google Play Store

1. **Build release app bundle**
   ```bash
   flutter build appbundle --release
   ```

2. **Output location**
   ```
   build/app/outputs/bundle/release/app-release.aab
   ```

### Build Configuration

Update `android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 33
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    defaultConfig {
        applicationId "com.globalfintech.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

## Building for iOS

### Prerequisites (macOS only)

1. **Install Xcode from App Store**

2. **Set up CocoaPods**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Configure signing**
   - Open `ios/Runner.xcworkspace` in Xcode
   - Select Runner project
   - Under Signing & Capabilities:
     - Select your development team
     - Set bundle identifier: `com.globalfintech.app`
     - Enable automatic signing

### Debug Build

1. **Build for simulator**
   ```bash
   flutter build ios --simulator --debug
   ```

2. **Build for device**
   ```bash
   flutter build ios --debug --no-codesign
   ```

### Release Build (IPA)

#### For Development/Testing (Ad Hoc)

1. **Build release iOS**
   ```bash
   flutter build ios --release
   ```

2. **Create IPA from Xcode**
   - Open `ios/Runner.xcworkspace` in Xcode
   - Select "Any iOS Device" as target
   - Product > Archive
   - In Archives window, select the archive
   - Click "Distribute App"
   - Select "Ad Hoc" distribution
   - Follow the prompts
   - Export IPA

3. **Output location**
   ```
   The exported IPA will be in the location you selected
   ```

#### For App Store

1. **Update version and build number**
   ```bash
   # Update pubspec.yaml
   version: 1.0.0+1
   ```

2. **Build release iOS**
   ```bash
   flutter build ios --release
   ```

3. **Create IPA for App Store**
   - Open `ios/Runner.xcworkspace` in Xcode
   - Product > Archive
   - In Archives window, select the archive
   - Click "Distribute App"
   - Select "App Store Connect"
   - Follow the prompts
   - Upload to App Store Connect

### iOS Configuration

Update `ios/Runner/Info.plist`:

```xml
<key>CFBundleDisplayName</key>
<string>Global FinTech</string>
<key>CFBundleIdentifier</key>
<string>com.globalfintech.app</string>
<key>CFBundleVersion</key>
<string>1</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
```

## Build Scripts

### Android Build Script

Create `scripts/build-android.sh`:

```bash
#!/bin/bash

echo "Building Android APK..."
flutter build apk --release

if [ $? -eq 0 ]; then
    echo "✓ Build successful!"
    echo "APK location: build/app/outputs/flutter-apk/app-release.apk"

    # Copy to releases directory
    mkdir -p ../../releases/android
    cp build/app/outputs/flutter-apk/app-release.apk ../../releases/android/global-fintech-$(date +%Y%m%d-%H%M%S).apk
    echo "✓ APK copied to releases/android/"
else
    echo "✗ Build failed!"
    exit 1
fi
```

### iOS Build Script

Create `scripts/build-ios.sh`:

```bash
#!/bin/bash

echo "Building iOS app..."
flutter build ios --release

if [ $? -eq 0 ]; then
    echo "✓ Build successful!"
    echo "Now open ios/Runner.xcworkspace in Xcode to archive and export IPA"
    open ios/Runner.xcworkspace
else
    echo "✗ Build failed!"
    exit 1
fi
```

### Make scripts executable

```bash
chmod +x scripts/build-android.sh
chmod +x scripts/build-ios.sh
```

## Build Flavors (Development, Staging, Production)

### Setup Flavors

1. **Create flavor files**
   ```
   lib/config/dev.dart
   lib/config/staging.dart
   lib/config/prod.dart
   ```

2. **Configure Android flavors** in `android/app/build.gradle`:
   ```gradle
   android {
       ...
       flavorDimensions "environment"
       productFlavors {
           dev {
               dimension "environment"
               applicationIdSuffix ".dev"
               versionNameSuffix "-dev"
           }
           staging {
               dimension "environment"
               applicationIdSuffix ".staging"
               versionNameSuffix "-staging"
           }
           prod {
               dimension "environment"
           }
       }
   }
   ```

3. **Build with flavor**
   ```bash
   flutter build apk --flavor dev
   flutter build apk --flavor staging
   flutter build apk --flavor prod --release
   ```

## Continuous Integration (CI/CD)

### GitHub Actions for Android

Create `.github/workflows/build-android.yml`:

```yaml
name: Build Android APK

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'zulu'
        java-version: '11'

    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.10.0'
        channel: 'stable'

    - name: Get dependencies
      run: |
        cd apps/mobile
        flutter pub get

    - name: Run tests
      run: |
        cd apps/mobile
        flutter test

    - name: Build APK
      run: |
        cd apps/mobile
        flutter build apk --release

    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release
        path: apps/mobile/build/app/outputs/flutter-apk/app-release.apk
```

### GitHub Actions for iOS

Create `.github/workflows/build-ios.yml`:

```yaml
name: Build iOS IPA

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: macos-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.10.0'
        channel: 'stable'

    - name: Get dependencies
      run: |
        cd apps/mobile
        flutter pub get

    - name: Install CocoaPods
      run: |
        cd apps/mobile/ios
        pod install

    - name: Build iOS
      run: |
        cd apps/mobile
        flutter build ios --release --no-codesign
```

## Testing Builds

### Android Testing

1. **Install APK on device**
   ```bash
   adb install build/app/outputs/flutter-apk/app-release.apk
   ```

2. **Install APK on emulator**
   ```bash
   # Start emulator
   flutter emulators --launch <emulator_id>

   # Install APK
   adb install build/app/outputs/flutter-apk/app-release.apk
   ```

### iOS Testing

1. **Install on simulator**
   ```bash
   flutter install --simulator
   ```

2. **Install on device**
   - Use Xcode to install via device manager
   - Or use TestFlight for distribution

## App Store Submission

### Google Play Store (Android)

1. **Prepare store listing**
   - App name, description, screenshots
   - Privacy policy URL
   - Content rating

2. **Upload AAB**
   - Go to Google Play Console
   - Create new release
   - Upload `app-release.aab`
   - Complete release notes
   - Submit for review

### Apple App Store (iOS)

1. **Prepare in App Store Connect**
   - Create app record
   - Add metadata (name, description, keywords)
   - Upload screenshots
   - Set pricing

2. **Upload IPA**
   - Use Xcode > Product > Archive
   - Or use `xcrun altool`:
     ```bash
     xcrun altool --upload-app -f app.ipa -u <apple-id> -p <app-specific-password>
     ```

3. **Submit for review**

## Troubleshooting

### Common Android Issues

1. **Gradle build fails**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   flutter clean
   flutter pub get
   ```

2. **Keystore errors**
   - Verify key.properties file path
   - Check keystore password
   - Ensure keystore file exists

3. **MultiDex error**
   Add to `android/app/build.gradle`:
   ```gradle
   defaultConfig {
       multiDexEnabled true
   }
   ```

### Common iOS Issues

1. **CocoaPods issues**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

2. **Signing errors**
   - Check Xcode signing settings
   - Verify provisioning profile
   - Update certificates in Keychain

3. **Build fails after pod install**
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install --repo-update
   cd ..
   flutter clean
   ```

## Build Checklist

### Pre-Release Checklist

- [ ] All tests passing
- [ ] Version number updated in pubspec.yaml
- [ ] Build number incremented
- [ ] App icons added (all sizes)
- [ ] Splash screen configured
- [ ] Privacy policy URL added
- [ ] Terms of service added
- [ ] API endpoints point to production
- [ ] Debug logging disabled
- [ ] Crash reporting configured
- [ ] Analytics configured
- [ ] Push notifications tested
- [ ] Deep linking tested
- [ ] Performance tested
- [ ] Security review completed

### Android Specific

- [ ] Package name set correctly
- [ ] Keystore configured
- [ ] Proguard rules added
- [ ] App bundle built
- [ ] Screenshots prepared (all sizes)
- [ ] Feature graphic created
- [ ] Store listing complete

### iOS Specific

- [ ] Bundle identifier set
- [ ] Signing certificates valid
- [ ] Provisioning profile configured
- [ ] App icons added (all sizes)
- [ ] Launch screen configured
- [ ] Screenshots prepared (all device sizes)
- [ ] App privacy details filled
- [ ] TestFlight tested

## Resources

- [Flutter Build Documentation](https://docs.flutter.dev/deployment)
- [Android Deployment](https://docs.flutter.dev/deployment/android)
- [iOS Deployment](https://docs.flutter.dev/deployment/ios)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com/)

## Support

For build issues:
- Check Flutter doctor: `flutter doctor -v`
- Flutter issues: https://github.com/flutter/flutter/issues
- Project issues: https://github.com/yourusername/Global-FinTech/issues

---

**Last Updated**: November 26, 2025
