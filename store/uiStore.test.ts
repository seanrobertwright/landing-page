import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH, DEFAULT_SIDEBAR_WIDTH } from "./uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    // Reset store to default state
    useUIStore.setState({ sidebarWidth: DEFAULT_SIDEBAR_WIDTH });
  });

  it("should have default sidebar width", () => {
    const { sidebarWidth } = useUIStore.getState();
    expect(sidebarWidth).toBe(DEFAULT_SIDEBAR_WIDTH);
  });

  it("should update sidebar width within bounds", () => {
    const { setSidebarWidth } = useUIStore.getState();

    setSidebarWidth(350);
    expect(useUIStore.getState().sidebarWidth).toBe(350);
  });

  it("should clamp sidebar width to minimum", () => {
    const { setSidebarWidth } = useUIStore.getState();

    setSidebarWidth(100);
    expect(useUIStore.getState().sidebarWidth).toBe(MIN_SIDEBAR_WIDTH);
  });

  it("should clamp sidebar width to maximum", () => {
    const { setSidebarWidth } = useUIStore.getState();

    setSidebarWidth(600);
    expect(useUIStore.getState().sidebarWidth).toBe(MAX_SIDEBAR_WIDTH);
  });

  it("should export correct constants", () => {
    expect(MIN_SIDEBAR_WIDTH).toBe(200);
    expect(MAX_SIDEBAR_WIDTH).toBe(500);
    expect(DEFAULT_SIDEBAR_WIDTH).toBe(280);
  });
});
