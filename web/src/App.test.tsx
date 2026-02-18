import { render, screen } from "@testing-library/react";
import App from "./App";
import { describe, expect, it } from "vitest";

describe("App", () => {
  it("renders reference title", () => {
    render(<App />);
    expect(screen.getByText(/Projects \(Refine \+ Ant Design\)/i)).toBeDefined();
  });
});
