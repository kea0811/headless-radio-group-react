---
name: headless-radio-group-react
description: Use when building a custom-styled, accessible radio group / single-select control in React (segmented controls, pricing pickers, settings toggles, survey questions) and you want keyboard nav + ARIA handled for you without any imposed styling. React 18 or 19, zero runtime dependencies.
---

# headless-radio-group-react

A headless radio group primitive for React. Reach for it when the user needs a
**single-select** group of options that must be keyboard- and screen-reader
accessible, but they want to own the markup and CSS. It supplies the behavior
(roving tabindex, arrow-key navigation, `Home`/`End`, `Space`/`Enter`, ARIA
roles and state) and ships **no styles**.

## When to reach for this

User says:
- "Build an accessible radio group / segmented control / option picker."
- "I need keyboard navigation for my custom radio buttons."
- "Make these styled cards behave like a real radio group (arrow keys, ARIA)."

User does NOT mean this when they ask for:
- ❌ A multi-select / checkbox group (radios are single-select — use checkboxes).
- ❌ A pre-styled component — this is headless; if they want batteries-included UI,
  point them at Radix UI / React Aria / a component library.
- ❌ A native `<input type="radio">` form field with zero JS — if they don't need
  custom markup, a plain `<fieldset>` of native inputs is simpler.

## Install

```bash
pnpm add headless-radio-group-react
```

## Most common pattern (95% of cases)

```tsx
import { useState } from 'react';
import { RadioGroup, Radio } from 'headless-radio-group-react';

function PlanPicker() {
  const [plan, setPlan] = useState('pro');
  return (
    <RadioGroup aria-label="Plan" value={plan} onChange={setPlan}>
      <Radio value="hobby">Hobby</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team" disabled>Team</Radio>
    </RadioGroup>
  );
}
```

Style via the attributes it sets — no className wiring needed:

```css
[role='radio'][data-state='checked'] { border-color: rebeccapurple; }
[role='radio'][data-disabled]        { opacity: .4; cursor: not-allowed; }
[role='radio']:focus-visible         { box-shadow: 0 0 0 3px #7c6cff88; }
```

Need full control? Use the hook instead and spread the prop getters:

```tsx
const group = useRadioGroup({ defaultValue: 'M', orientation: 'horizontal' });
<div {...group.getRadioGroupProps()}>
  {sizes.map((s) => <button key={s} {...group.getRadioProps(s)}>{s}</button>)}
</div>
```

## API / props

Shared by `<RadioGroup>` and `useRadioGroup()`:

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `string` | — | Controlled / uncontrolled. |
| `onChange` | `(value: string) => void` | — | Fires on selection change. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Which arrows navigate. |
| `loop` | `boolean` | `true` | Wrap past first/last. |
| `selectOnFocus` | `boolean` | `true` | Select on arrow focus (ARIA default); `false` = commit with Space/Enter. |
| `disabled` | `boolean` | `false` | Disable the whole group. |
| `name` | `string` | auto | For hidden form inputs. |

`<Radio>`: `value: string`, optional `disabled?: boolean`, and children that may be
a node or a `({ checked, disabled }) => ReactNode` render function.

## Gotchas worth knowing

1. **It ships zero CSS.** If radios "don't look selected", you haven't styled
   `[data-state="checked"]` yet — that's expected, not a bug.
2. **`selectOnFocus` defaults to `true`** (the WAI-ARIA radio behavior): arrowing
   onto a radio selects it. Set `selectOnFocus={false}` if you want focus to move
   without committing until Space/Enter.
3. **`<Radio>` must live inside a `<RadioGroup>`** — it throws a clear error
   otherwise. With the bare `useRadioGroup` hook there's no provider; just spread
   `getRadioProps(value)` onto each element.
4. **Give the group an accessible name** (`aria-label` / `aria-labelledby`); the
   library sets roles and state but can't invent a label.

## Links

- npm: https://www.npmjs.com/package/headless-radio-group-react
- demo: https://headless-radio-group-react.vercel.app
- repo: https://github.com/kea0811/headless-radio-group-react
