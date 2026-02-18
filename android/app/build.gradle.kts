plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  id("com.google.dagger.hilt.android")
  id("com.apollographql.apollo3")
}

android {
  namespace = "com.example.frontend"
  compileSdk = 35

  defaultConfig {
    applicationId = "com.example.frontend"
    minSdk = 26
    targetSdk = 35
    versionCode = 1
    versionName = "0.1.0"
    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
  }

  buildFeatures {
    compose = true
  }

  composeOptions {
    kotlinCompilerExtensionVersion = "1.5.15"
  }
}

dependencies {
  implementation("androidx.core:core-ktx:1.15.0")
  implementation("androidx.activity:activity-compose:1.9.3")
  implementation("androidx.compose.material3:material3:1.3.1")
  implementation("org.orbit-mvi:orbit-viewmodel:9.0.0")
  implementation("org.orbit-mvi:orbit-compose:9.0.0")
  implementation("com.google.dagger:hilt-android:2.52")
  implementation("com.apollographql.apollo3:apollo-runtime:3.8.2")
  testImplementation("junit:junit:4.13.2")
}

apollo {
  service("service") {
    packageName.set("com.example.frontend")
    schemaFile.set(file("src/main/graphql/schema.graphqls"))
  }
}
