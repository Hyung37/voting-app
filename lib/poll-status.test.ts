import { describe, it, expect } from "vitest";
import { isPollOpen, canViewResults } from "./poll-status";

describe("isPollOpen", () => {
  it("is open with no closedAt and no deadline", () => {
    expect(isPollOpen({ closedAt: null, deadline: null })).toBe(true);
  });

  it("is closed once closedAt is set, regardless of deadline", () => {
    expect(
      isPollOpen({
        closedAt: new Date(),
        deadline: new Date(Date.now() + 60_000),
      }),
    ).toBe(false);
  });

  it("is closed once the deadline has passed", () => {
    expect(
      isPollOpen({ closedAt: null, deadline: new Date(Date.now() - 60_000) }),
    ).toBe(false);
  });

  it("is open before the deadline", () => {
    expect(
      isPollOpen({ closedAt: null, deadline: new Date(Date.now() + 60_000) }),
    ).toBe(true);
  });
});

describe("canViewResults", () => {
  it("shows live results while the poll is still open", () => {
    expect(
      canViewResults({
        closedAt: null,
        deadline: null,
        resultsVisibility: "live",
      }),
    ).toBe(true);
  });

  it("hides after-close results while the poll is still open", () => {
    expect(
      canViewResults({
        closedAt: null,
        deadline: null,
        resultsVisibility: "after_close",
      }),
    ).toBe(false);
  });

  it("shows after-close results once the poll is closed", () => {
    expect(
      canViewResults({
        closedAt: new Date(),
        deadline: null,
        resultsVisibility: "after_close",
      }),
    ).toBe(true);
  });
});
