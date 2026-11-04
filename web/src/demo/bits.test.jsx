import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PEOPLE, siteName } from "./data.js";
import { PersonSearch } from "./bits.jsx";

describe("person search", () => {
  it("matches every word against name, job and site, and picks with the keyboard", () => {
    const welder = PEOPLE.find((p) => p.title === "Welder");
    const onChange = vi.fn();
    render(<PersonSearch label="Person" people={PEOPLE} value={null} onChange={onChange} />);
    const box = screen.getByRole("combobox", { name: "Person" });
    fireEvent.change(box, { target: { value: `${welder.name.split(" ")[0]} welder ${siteName(welder.site)}` } });
    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
    expect(options.every((o) => /Welder/.test(o.textContent))).toBe(true);
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^p\d+$/));
  });

  it("says when nobody matches", () => {
    render(<PersonSearch label="Person" people={PEOPLE} value={null} onChange={() => {}} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzzz" } });
    expect(screen.getByRole("status").textContent).toContain("Nobody matches");
  });
});
