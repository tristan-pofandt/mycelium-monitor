// Which cards a Home shows, in what order and at what width (feature 10). Pure: the store's maps go in, a layout comes out.
// A layout is [{ id, size }] with size 1 or 2 columns. A person's own layout wins, then the admin's default for their role
// (Roles and permissions), then DEFAULT_LAYOUTS; cards the role may no longer have are dropped, the rest keep their order.
import { DEFAULT_LAYOUTS, HOME_CARDS } from "./homecards.jsx";

export const cardById = (id) => HOME_CARDS.find((c) => c.id === id);
export const titleOf = (card, persona) => (typeof card.title === "function" ? card.title(persona) : card.title);
export const allowed = (card, persona, caps = []) => !!card && (!card.roles || card.roles.includes(persona)) && !card.notFor?.includes(persona)
  && (!card.cap || caps.includes(card.cap));

export function layoutFor(persona, saved = {}, grants = {}, roleDefaults = {}) {
  const caps = grants[persona] || [];
  const base = saved[persona] || roleDefaults[persona] || DEFAULT_LAYOUTS[persona] || [];
  const seen = new Set();
  return base.flatMap(({ id, size }) => {
    const card = cardById(id);
    if (seen.has(id) || !allowed(card, persona, caps)) return [];
    seen.add(id);
    return [{ id, size: card.sizes.includes(size) ? size : card.sizes[0] }];
  });
}

// Cards the role may add that the layout doesn't show yet.
export const addable = (persona, layout, caps) => HOME_CARDS.filter((c) => allowed(c, persona, caps) && !layout.some((x) => x.id === c.id));

export function move(layout, from, to) {
  if (to < 0 || to >= layout.length || from === to) return layout;
  const next = [...layout];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

export const sameLayout = (a, b) => JSON.stringify(a) === JSON.stringify(b);
