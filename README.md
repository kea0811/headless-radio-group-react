# headless-radio-group-react

![tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)
![npm version](https://img.shields.io/npm/v/headless-radio-group-react.svg)
![npm downloads](https://img.shields.io/npm/dm/headless-radio-group-react.svg)
![bundle size](https://img.shields.io/bundlephobia/minzip/headless-radio-group-react?label=gzip)

**🌐 [Live demo →](https://headless-radio-group-react.vercel.app)**

> 🧩 Part of the **headless-** collection — accessibility-first React primitives. Find more at [github.com/kea0811?tab=repositories&q=headless](https://github.com/kea0811?tab=repositories&q=headless).

An accessible, **headless** radio group primitive for React. It handles the parts
that are easy to get wrong — roving tabindex, full keyboard navigation, and the
right ARIA — and leaves the markup and styling entirely to you. No CSS ships, no
opinions imposed. Works with **React 18 and 19**.

## For AI coding agents

Drop [`SKILL.md`](./SKILL.md) into your AI editor / Claude Code workspace and it
learns how to use this library — when to reach for it, the install + canonical
pattern, the public API, and the gotchas that are easy to miss.

## Install

```bash
pnpm add headless-radio-group-react
```

```bash
npm install headless-radio-group-react   # or: yarn add headless-radio-group-react
```

> _Bleeding edge or before the first npm release: `pnpm add github:kea0811/headless-radio-group-react`._

## Quick start

The component API is a tiny compound pair — `RadioGroup` + `Radio`:

```tsx
import { useState } from 'react';
import { RadioGroup, Radio } from 'headless-radio-group-react';

function PlanPicker() {
  const [plan, setPlan] = useState('pro');

  return (
    <RadioGroup aria-label="Plan" value={plan} onChange={setPlan}>
      <Radio value="hobby">Hobby</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team">Team</Radio>
    </RadioGroup>
  );
}
```

Nothing is styled. Each radio renders with `data-state="checked" | "unchecked"`
and (when disabled) `data-disabled`, so you target those in CSS:

```css
[role='radio'][data-state='checked'] {
  border-color: rebeccapurple;
}
[role='radio'][data-disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}
[role='radio']:focus-visible {
  box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.5);
}
```

## Keyboard interaction

Out of the box, the group follows the
[WAI-ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/):

| Keys | Action |
| --- | --- |
| <kbd>↓</kbd> / <kbd>→</kbd> | Move to (and select) the next enabled radio |
| <kbd>↑</kbd> / <kbd>←</kbd> | Move to (and select) the previous enabled radio |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to the first / last enabled radio |
| <kbd>Space</kbd> / <kbd>Enter</kbd> | Select the focused radio |
| <kbd>Tab</kbd> | Move into / out of the group (roving tabindex — one tab stop) |

Arrow keys are orientation-aware: a `horizontal` group navigates with ←/→, a
`vertical` group with ↑/↓.

## Options

Pass these to `<RadioGroup>` or `useRadioGroup()`:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Controlled selected value. |
| `defaultValue` | `string` | — | Initial value (uncontrolled). |
| `onChange` | `(value: string) => void` | — | Called when the selection changes. |
| `name` | `string` | auto (`useId`) | Group name, handy for hidden form inputs. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Which arrow keys navigate. |
| `loop` | `boolean` | `true` | Wrap focus past the first/last radio. |
| `selectOnFocus` | `boolean` | `true` | Select on arrow focus (the ARIA default). |
| `disabled` | `boolean` | `false` | Disable the entire group. |

`<Radio>` takes a `value: string` and an optional `disabled?: boolean`. Its child
can be a node, or a render function receiving `{ checked, disabled }`.

## Examples

### Controlled vs uncontrolled

```tsx
// Uncontrolled — the group tracks its own state.
<RadioGroup defaultValue="pro" onChange={(v) => console.log(v)}>…</RadioGroup>

// Controlled — you own the state.
<RadioGroup value={plan} onChange={setPlan}>…</RadioGroup>
```

### Custom indicator with a render prop

```tsx
<Radio value="teal">
  {({ checked }) => (
    <span className={checked ? 'swatch is-on' : 'swatch'}>
      {checked && <Check />}
    </span>
  )}
</Radio>
```

### Move-first-commit-later

```tsx
// Arrow keys move focus without selecting; Space/Enter commits.
<RadioGroup selectOnFocus={false} onChange={setAnswer}>…</RadioGroup>
```

### Just the hook

Skip the components and spread the prop getters onto your own elements:

```tsx
import { useRadioGroup } from 'headless-radio-group-react';

function Sizes() {
  const group = useRadioGroup({ defaultValue: 'M', orientation: 'horizontal' });

  return (
    <div {...group.getRadioGroupProps()}>
      {['S', 'M', 'L'].map((size) => (
        <button key={size} {...group.getRadioProps(size)}>
          {size}
        </button>
      ))}
    </div>
  );
}
```

`useRadioGroup` returns `{ value, name, setValue, getRadioGroupProps, getRadioProps }`.

## Accessibility

- The wrapper gets `role="radiogroup"` and `aria-orientation`; give it an
  `aria-label` or `aria-labelledby`.
- Each radio gets `role="radio"` and `aria-checked`. Disabled radios get
  `aria-disabled` and are skipped by the keyboard.
- **Roving tabindex**: exactly one radio is in the tab order at a time, so
  <kbd>Tab</kbd> lands on the group as a single stop.
- Honors `selectOnFocus` so you can choose the ARIA default (select on focus) or
  the explicit-commit behavior.

## Contributing

Issues and PRs are welcome. To develop locally:

```bash
pnpm install
pnpm test          # vitest
pnpm test:coverage # 100% required
pnpm build         # ESM + CJS + .d.ts
pnpm demo:dev      # run the showcase
```

## License

[MIT](./LICENSE) © 2026 kea0811
