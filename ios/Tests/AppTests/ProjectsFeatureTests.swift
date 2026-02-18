import ComposableArchitecture
import XCTest
@testable import AppFeature

final class ProjectsFeatureTests: XCTestCase {
  func testAddTappedAppendsItem() async {
    let store = TestStore(initialState: ProjectsFeature.State()) {
      ProjectsFeature()
    }

    await store.send(.newItemChanged("Helios")) {
      $0.newItem = "Helios"
    }

    await store.send(.addTapped) {
      $0.items.append("Helios")
      $0.newItem = ""
    }
  }
}
