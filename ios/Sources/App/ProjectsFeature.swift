import ComposableArchitecture
import Foundation

@Reducer
public struct ProjectsFeature {
  @ObservableState
  public struct State: Equatable {
    public var items: [String] = ["Apollo", "Atlas"]
    public var newItem = ""
    public init() {}
  }

  public enum Action: Equatable {
    case newItemChanged(String)
    case addTapped
  }

  public init() {}

  public var body: some ReducerOf<Self> {
    Reduce { state, action in
      switch action {
      case .newItemChanged(let value):
        state.newItem = value
        return .none
      case .addTapped:
        guard !state.newItem.isEmpty else { return .none }
        state.items.append(state.newItem)
        state.newItem = ""
        return .none
      }
    }
  }
}
