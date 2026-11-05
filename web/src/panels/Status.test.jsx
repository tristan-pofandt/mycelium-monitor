import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./Status.jsx";

describe("StatusBadge", () => {
  it("names status in words, not colour alone", () => {
    render(<><StatusBadge status="down" /><StatusBadge status={null} /></>);
    expect(screen.getByText("Down")).toBeTruthy();
    expect(screen.getByText("Unknown")).toBeTruthy();
  });
});
