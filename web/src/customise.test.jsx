import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { moveItem, useCustomise } from "./customise.jsx";

const CARDS = ["a", "b", "c"].map((id) => ({ id, title: `Card ${id}`, sizes: [1, 2], render: () => <section className="panel-card">{id}</section> }));

function Board({ onSave, layout = [{ id: "a", size: 1 }, { id: "b", size: 1 }] }) {
  const board = useCustomise({ layout, cards: CARDS, onSave });
  return <div className="page-grid">{board.bar}{board.slots}{board.extras}</div>;
}

describe("customise", () => {
  it("moves one item without touching the rest", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(["a", "b"], 0, 5)).toEqual(["a", "b"]);
  });

  it("reorders with Move down and saves on Done", () => {
    const onSave = vi.fn();
    const { container } = render(<Board onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: /Customise/ }));
    fireEvent.click(screen.getAllByRole("button", { name: "Move down" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onSave).toHaveBeenCalledWith([{ id: "b", size: 1 }, { id: "a", size: 1 }]);
    expect(container.querySelectorAll(".cust-tools")).toHaveLength(0);
  });

  it("drops cards the viewer may no longer have, and saves nothing when nothing changed", () => {
    const onSave = vi.fn();
    const { container } = render(<Board onSave={onSave} layout={[{ id: "a", size: 1 }, { id: "gone", size: 1 }]} />);
    expect(container.querySelectorAll(".cust-slot")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /Customise/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onSave).not.toHaveBeenCalled();
  });
});
