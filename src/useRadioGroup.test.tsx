import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { useRadioGroup } from './useRadioGroup';
import type { UseRadioGroupOptions } from './types';

const VALUES = ['a', 'b', 'c'] as const;

interface HarnessProps extends UseRadioGroupOptions {
  disabledMap?: Record<string, boolean>;
  /** Render only one item, calling getRadioProps with NO options object. */
  noOptions?: boolean;
}

function Harness({ disabledMap = {}, noOptions, ...options }: HarnessProps) {
  const group = useRadioGroup(options);

  if (noOptions) {
    const props = group.getRadioProps('a');
    return (
      <div {...group.getRadioGroupProps()} data-testid="group" data-name={group.name}>
        <div {...props} data-testid="r-a">
          a
        </div>
      </div>
    );
  }

  return (
    <div {...group.getRadioGroupProps()} data-testid="group" data-name={group.name}>
      {VALUES.map((v) => {
        const props = group.getRadioProps(v, { disabled: disabledMap[v] });
        return (
          <div key={v} {...props} data-testid={`r-${v}`}>
            {v}
          </div>
        );
      })}
      <button type="button" data-testid="set-b" onClick={() => group.setValue('b')}>
        set b
      </button>
    </div>
  );
}

const tabindex = (el: HTMLElement) => el.getAttribute('tabindex');

describe('useRadioGroup — wiring & ARIA', () => {
  it('exposes a radiogroup with orientation metadata and no selection', () => {
    const { getByTestId } = render(<Harness />);
    const group = getByTestId('group');
    expect(group).toHaveAttribute('role', 'radiogroup');
    expect(group).toHaveAttribute('aria-orientation', 'vertical');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).not.toHaveAttribute('aria-disabled');

    for (const v of VALUES) {
      const radio = getByTestId(`r-${v}`);
      expect(radio).toHaveAttribute('role', 'radio');
      expect(radio).toHaveAttribute('aria-checked', 'false');
      expect(radio).toHaveAttribute('data-state', 'unchecked');
      expect(radio).not.toHaveAttribute('data-disabled');
    }
  });

  it('puts the single tab stop on the first enabled radio when nothing is selected', () => {
    const { getByTestId } = render(<Harness />);
    expect(tabindex(getByTestId('r-a'))).toBe('0');
    expect(tabindex(getByTestId('r-b'))).toBe('-1');
    expect(tabindex(getByTestId('r-c'))).toBe('-1');
  });

  it('auto-generates a name and honors an explicit one', () => {
    const auto = render(<Harness />);
    expect(auto.getByTestId('group').getAttribute('data-name')).toBeTruthy();
    cleanup();
    const explicit = render(<Harness name="flavor" />);
    expect(explicit.getByTestId('group')).toHaveAttribute('data-name', 'flavor');
  });

  it('supports calling getRadioProps without an options argument', () => {
    const { getByTestId } = render(<Harness noOptions />);
    const radio = getByTestId('r-a');
    expect(radio).toHaveAttribute('role', 'radio');
    expect(tabindex(radio)).toBe('0');
  });
});

describe('useRadioGroup — selection', () => {
  it('selects on click and moves the tab stop (uncontrolled)', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(<Harness onChange={onChange} />);

    fireEvent.click(getByTestId('r-b'));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(getByTestId('r-b')).toHaveAttribute('aria-checked', 'true');
    expect(getByTestId('r-b')).toHaveAttribute('data-state', 'checked');
    expect(tabindex(getByTestId('r-b'))).toBe('0');
    expect(tabindex(getByTestId('r-a'))).toBe('-1');
  });

  it('starts from defaultValue in uncontrolled mode', () => {
    const { getByTestId } = render(<Harness defaultValue="c" />);
    expect(getByTestId('r-c')).toHaveAttribute('aria-checked', 'true');
    expect(tabindex(getByTestId('r-c'))).toBe('0');
  });

  it('works without an onChange handler', () => {
    const { getByTestId } = render(<Harness />);
    expect(() => fireEvent.click(getByTestId('r-a'))).not.toThrow();
    expect(getByTestId('r-a')).toHaveAttribute('aria-checked', 'true');
  });

  it('setValue updates the selection programmatically', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(<Harness onChange={onChange} />);
    fireEvent.click(getByTestId('set-b'));
    expect(getByTestId('r-b')).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('useRadioGroup — controlled mode', () => {
  it('does not mutate internal state when the parent ignores the change', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(<Harness value="a" onChange={onChange} />);
    expect(getByTestId('r-a')).toHaveAttribute('aria-checked', 'true');
    expect(tabindex(getByTestId('r-a'))).toBe('0');

    // Parent ignores the change → selection stays on "a", but onChange still fires.
    fireEvent.click(getByTestId('r-c'));
    expect(onChange).toHaveBeenCalledWith('c');
    expect(getByTestId('r-a')).toHaveAttribute('aria-checked', 'true');
    expect(getByTestId('r-c')).toHaveAttribute('aria-checked', 'false');
  });

  it('re-resolves the tab stop to the selected value when the old one is disabled', () => {
    const { getByTestId, rerender } = render(<Harness value="a" />);
    expect(tabindex(getByTestId('r-a'))).toBe('0');

    // value moves to an enabled "b" while the previously-focusable "a" is disabled:
    // the tab stop must jump to the still-valid selected value.
    rerender(<Harness value="b" disabledMap={{ a: true }} />);
    expect(tabindex(getByTestId('r-b'))).toBe('0');
    expect(tabindex(getByTestId('r-a'))).toBe('-1');
  });
});

describe('useRadioGroup — keyboard navigation (vertical, looping)', () => {
  it('arrows move focus and select on focus, wrapping at both ends', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(<Harness onChange={onChange} />);

    fireEvent.keyDown(getByTestId('r-a'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(getByTestId('r-b'));
    expect(getByTestId('r-b')).toHaveAttribute('aria-checked', 'true');

    fireEvent.keyDown(getByTestId('r-b'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(getByTestId('r-a'));

    // Wrap backwards: a → c
    fireEvent.keyDown(getByTestId('r-a'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(getByTestId('r-c'));

    // Wrap forwards: c → a
    fireEvent.keyDown(getByTestId('r-c'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(getByTestId('r-a'));
  });

  it('Home and End jump to the first and last radios', () => {
    const { getByTestId } = render(<Harness defaultValue="b" />);
    fireEvent.keyDown(getByTestId('r-b'), { key: 'End' });
    expect(document.activeElement).toBe(getByTestId('r-c'));
    fireEvent.keyDown(getByTestId('r-c'), { key: 'Home' });
    expect(document.activeElement).toBe(getByTestId('r-a'));
  });

  it('ignores keys that are not navigation keys, and the off-axis arrows', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(<Harness onChange={onChange} />);
    fireEvent.keyDown(getByTestId('r-a'), { key: 'x' });
    fireEvent.keyDown(getByTestId('r-a'), { key: 'ArrowLeft' }); // off-axis for vertical
    expect(onChange).not.toHaveBeenCalled();
    expect(tabindex(getByTestId('r-a'))).toBe('0');
  });
});

describe('useRadioGroup — orientation & looping options', () => {
  it('navigates with left/right when horizontal and reflects aria-orientation', () => {
    const { getByTestId } = render(<Harness orientation="horizontal" />);
    expect(getByTestId('group')).toHaveAttribute('aria-orientation', 'horizontal');

    fireEvent.keyDown(getByTestId('r-a'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(getByTestId('r-b'));
    fireEvent.keyDown(getByTestId('r-b'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(getByTestId('r-a'));

    // Off-axis arrow does nothing in horizontal mode.
    fireEvent.keyDown(getByTestId('r-a'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(getByTestId('r-a'));
  });

  it('clamps instead of wrapping when loop is false', () => {
    const { getByTestId } = render(<Harness loop={false} defaultValue="a" />);
    fireEvent.keyDown(getByTestId('r-a'), { key: 'ArrowUp' }); // already first
    expect(document.activeElement).toBe(getByTestId('r-a'));

    fireEvent.keyDown(getByTestId('r-a'), { key: 'End' });
    expect(document.activeElement).toBe(getByTestId('r-c'));
    fireEvent.keyDown(getByTestId('r-c'), { key: 'ArrowDown' }); // already last
    expect(document.activeElement).toBe(getByTestId('r-c'));
  });
});

describe('useRadioGroup — selectOnFocus = false', () => {
  it('moves focus without selecting until Space/Enter is pressed', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Harness selectOnFocus={false} onChange={onChange} />,
    );

    fireEvent.keyDown(getByTestId('r-a'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(getByTestId('r-b'));
    expect(getByTestId('r-b')).toHaveAttribute('aria-checked', 'false');
    expect(onChange).not.toHaveBeenCalled();
    expect(tabindex(getByTestId('r-b'))).toBe('0'); // tab stop followed focus

    fireEvent.keyDown(getByTestId('r-b'), { key: ' ' });
    expect(getByTestId('r-b')).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenCalledTimes(1);

    // Re-committing the same value with Enter must not fire onChange again.
    fireEvent.keyDown(getByTestId('r-b'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('useRadioGroup — disabled items', () => {
  it('skips disabled radios, ignores their clicks and keys', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Harness onChange={onChange} disabledMap={{ b: true }} />,
    );

    const b = getByTestId('r-b');
    expect(b).toHaveAttribute('aria-disabled', 'true');
    expect(b).toHaveAttribute('data-disabled', '');
    expect(tabindex(b)).toBe('-1');

    // Arrow from a skips the disabled b → lands on c (and selects it on focus).
    fireEvent.keyDown(getByTestId('r-a'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(getByTestId('r-c'));
    expect(getByTestId('r-c')).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenLastCalledWith('c');

    // Clicking a disabled radio does nothing.
    fireEvent.click(b);
    expect(b).toHaveAttribute('aria-checked', 'false');

    // Keys fired on a disabled radio are inert: select is suppressed and
    // navigation has no enabled origin.
    fireEvent.keyDown(b, { key: 'Enter' });
    fireEvent.keyDown(b, { key: 'ArrowDown' });
    expect(b).toHaveAttribute('aria-checked', 'false');
    expect(onChange).toHaveBeenCalledTimes(1); // only the 'c' from arrow nav
  });

  it('leaves no tab stop when every radio is disabled', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Harness onChange={onChange} disabledMap={{ a: true, b: true, c: true }} />,
    );
    expect(tabindex(getByTestId('r-a'))).toBe('-1');
    expect(tabindex(getByTestId('r-c'))).toBe('-1');

    // Navigating with no enabled radios is a no-op.
    fireEvent.keyDown(getByTestId('r-a'), { key: 'ArrowDown' });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('useRadioGroup — disabled group', () => {
  it('marks the group disabled and blocks all interaction', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(<Harness disabled onChange={onChange} />);

    expect(getByTestId('group')).toHaveAttribute('aria-disabled', 'true');
    for (const v of VALUES) {
      const radio = getByTestId(`r-${v}`);
      expect(radio).toHaveAttribute('aria-disabled', 'true');
      expect(tabindex(radio)).toBe('-1');
    }

    fireEvent.click(getByTestId('r-a'));
    fireEvent.keyDown(getByTestId('r-a'), { key: 'ArrowDown' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
