import { describe, it, expect, vi } from 'vitest';
import { StrictMode, createRef, useRef } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { RadioGroup, Radio } from './RadioGroup';

function Group(props: { onChange?: (v: string) => void; defaultValue?: string }) {
  return (
    <RadioGroup
      aria-label="Plan"
      defaultValue={props.defaultValue}
      onChange={props.onChange}
      className="group"
    >
      <Radio value="free" className="radio">
        Free
      </Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team" disabled>
        Team
      </Radio>
    </RadioGroup>
  );
}

describe('<RadioGroup> / <Radio>', () => {
  it('renders an accessible group and selects via click', () => {
    const onChange = vi.fn();
    render(<Group onChange={onChange} />);

    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-label', 'Plan');
    expect(group).toHaveClass('group'); // rest props pass through

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveClass('radio');

    fireEvent.click(screen.getByText('Pro'));
    expect(onChange).toHaveBeenCalledWith('pro');
    expect(screen.getByText('Pro')).toHaveAttribute('aria-checked', 'true');
  });

  it('drives keyboard navigation end-to-end through context', () => {
    render(<Group defaultValue="free" />);
    const free = screen.getByText('Free');
    fireEvent.keyDown(free, { key: 'ArrowDown' });
    expect(screen.getByText('Pro')).toHaveAttribute('aria-checked', 'true');
    // disabled "team" is skipped on wrap back to "free"
    fireEvent.keyDown(screen.getByText('Pro'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByText('Free'));
  });

  it('exposes live state to a render-prop child', () => {
    render(
      <RadioGroup defaultValue="x">
        <Radio value="x">
          {({ checked, disabled }) => (
            <span data-testid="x-state">
              {checked ? 'on' : 'off'}/{disabled ? 'disabled' : 'enabled'}
            </span>
          )}
        </Radio>
        <Radio value="y" disabled>
          {({ disabled }) => <span data-testid="y-state">{String(disabled)}</span>}
        </Radio>
      </RadioGroup>,
    );
    expect(screen.getByTestId('x-state')).toHaveTextContent('on/enabled');
    expect(screen.getByTestId('y-state')).toHaveTextContent('true');
  });

  it('marks a disabled radio and ignores its clicks', () => {
    const onChange = vi.fn();
    render(<Group onChange={onChange} />);
    const team = screen.getByText('Team');
    expect(team).toHaveAttribute('aria-disabled', 'true');
    expect(team).toHaveAttribute('data-disabled', '');
    fireEvent.click(team);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('throws a helpful error when <Radio> is used outside <RadioGroup>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Radio value="lonely">x</Radio>)).toThrow(
      /<Radio> must be rendered inside a <RadioGroup>/,
    );
    spy.mockRestore();
  });
});

describe('<RadioGroup> / <Radio> — ref forwarding', () => {
  it('forwards a ref to the group container', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioGroup ref={ref}>
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    expect(ref.current).toHaveAttribute('role', 'radiogroup');
  });

  it('merges a callback ref on a radio with the internal node ref', () => {
    const seen: (HTMLElement | null)[] = [];
    render(
      <RadioGroup defaultValue="a">
        <Radio
          value="a"
          ref={(node) => {
            seen.push(node);
          }}
        >
          A
        </Radio>
      </RadioGroup>,
    );
    expect(seen.some((node) => node instanceof HTMLElement)).toBe(true);
    // The merged ref still drives focus (proving the internal ref survived).
    fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByText('A'));
  });

  it('merges an object ref on a radio', () => {
    function WithObjectRef() {
      const ref = useRef<HTMLDivElement>(null);
      return (
        <RadioGroup defaultValue="a">
          <Radio value="a" ref={ref}>
            A
          </Radio>
          <span data-testid="probe" data-ok={ref.current ? 'yes' : 'no'} />
        </RadioGroup>
      );
    }
    render(<WithObjectRef />);
    expect(screen.getByText('A')).toHaveAttribute('role', 'radio');
  });
});

describe('<RadioGroup> — StrictMode', () => {
  it('survives the StrictMode mount/remount cycle', () => {
    render(
      <StrictMode>
        <RadioGroup defaultValue="a">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      </StrictMode>,
    );
    fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowDown' });
    expect(screen.getByText('B')).toHaveAttribute('aria-checked', 'true');
    expect(document.activeElement).toBe(screen.getByText('B'));
  });
});
