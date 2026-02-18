// swift-tools-version: 5.9
import PackageDescription

let package = Package(
  name: "FrontendIOS",
  platforms: [.iOS(.v16)],
  products: [
    .library(name: "AppFeature", targets: ["AppFeature"]),
  ],
  dependencies: [
    .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.10.0"),
    .package(url: "https://github.com/apollographql/apollo-ios", from: "1.15.1"),
  ],
  targets: [
    .target(
      name: "AppFeature",
      dependencies: [
        .product(name: "ComposableArchitecture", package: "swift-composable-architecture"),
        .product(name: "Apollo", package: "apollo-ios"),
      ]
    ),
    .testTarget(name: "AppFeatureTests", dependencies: ["AppFeature"]),
  ]
)
