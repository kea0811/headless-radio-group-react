import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type {
  GetRadioPropsOptions,
  RadioGroupProps,
  RadioProps,
  UseRadioGroupOptions,
  UseRadioGroupResult,
} from './types';

type Direction = 'next' | 'prev' | 'first' | 'last' | 'select';

/**
 * Map a keyboard key to a navigation intent, or `null` if the key is irrelevant.
 * Arrow handling is orientation-aware; Home/End and Space/Enter are universal.
 */
function keyToDirection(
  key: string,
  orientation: 'horizontal' | 'vertical',
): Direction | null {
  if (key === 'Home') return 'first';
  if (key === 'End') return 'last';
  if (key === ' ' || key === 'Enter') return 'select';
  if (orientation === 'horizontal') {
    if (key === 'ArrowRight') return 'next';
    if (key === 'ArrowLeft') return 'prev';
    return null;
  }
  if (key === 'ArrowDown') return 'next';
  if (key === 'ArrowUp') return 'prev';
  return null;
}

/**
 * Headless engine for an accessible radio group. Manages selection (controlled
 * or uncontrolled), roving tabindex, and WAI-ARIA keyboard interaction, and
 * hands back prop getters you spread onto your own elements.
 */
export function useRadioGroup(
  options: UseRadioGroupOptions = {},
): UseRadioGroupResult {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    name,
    orientation = 'vertical',
    loop = true,
    disabled: groupDisabled = false,
    selectOnFocus = true,
  } = options;

  const generatedName = useId();
  const resolvedName = name ?? generatedName;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(
    defaultValue,
  );
  const value = isControlled ? controlledValue : uncontrolledValue;

  // Keep the latest selected value + onChange in refs so `setValue` stays stable
  // and never fires onChange with a stale comparison.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      if (next !== valueRef.current) {
        onChangeRef.current?.(next);
      }
    },
    [isControlled],
  );

  // The value that currently owns the single tab stop (roving tabindex).
  const [focusableValue, setFocusableValue] = useState<string | undefined>(
    () => controlledValue ?? defaultValue,
  );

  // Live registry of rendered items as value -> disabled, plus their nodes.
  // Rebuilt every render as `getRadioProps` is called for each item. A Map
  // (keyed by value) is deliberate: StrictMode double-renders each child, so an
  // array accumulator would collect duplicates and corrupt navigation — keying
  // by value collapses the repeats while preserving insertion (DOM) order.
  const itemsRef = useRef(new Map<string, boolean>());
  itemsRef.current.clear();
  const nodesRef = useRef(new Map<string, HTMLElement>());

  // Stable (reads only refs) so it can sit in `move`'s dependency list without
  // churning callback identity.
  const collectEnabled = useCallback((): string[] => {
    const enabled: string[] = [];
    itemsRef.current.forEach((itemDisabled, itemValue) => {
      if (!itemDisabled) {
        enabled.push(itemValue);
      }
    });
    return enabled;
  }, []);

  // Keep exactly one enabled radio tabbable. Runs after commit, once the item
  // registry is fully populated, and self-heals when items/selection change.
  useLayoutEffect(() => {
    const enabled = collectEnabled();

    let nextFocusable = focusableValue;
    if (groupDisabled || enabled.length === 0) {
      nextFocusable = undefined;
    } else if (focusableValue === undefined || !enabled.includes(focusableValue)) {
      nextFocusable = enabled.includes(value as string)
        ? (value as string)
        : enabled[0];
    }

    if (nextFocusable !== focusableValue) {
      setFocusableValue(nextFocusable);
    }
  });

  const move = useCallback(
    (fromValue: string, direction: Direction) => {
      const enabled = collectEnabled();
      if (enabled.length === 0) {
        return;
      }

      const currentIndex = enabled.indexOf(fromValue);
      if (currentIndex === -1) {
        // Focus sits on a disabled radio — nothing to move from.
        return;
      }

      let targetIndex: number;
      if (direction === 'first') {
        targetIndex = 0;
      } else if (direction === 'last') {
        targetIndex = enabled.length - 1;
      } else {
        const step = direction === 'next' ? 1 : -1;
        targetIndex = currentIndex + step;
        if (loop) {
          targetIndex = (targetIndex + enabled.length) % enabled.length;
        } else {
          targetIndex = Math.min(Math.max(targetIndex, 0), enabled.length - 1);
        }
      }

      const targetValue = enabled[targetIndex];
      nodesRef.current.get(targetValue)!.focus();
      setFocusableValue(targetValue);
      if (selectOnFocus) {
        setValue(targetValue);
      }
    },
    [collectEnabled, loop, selectOnFocus, setValue],
  );

  const getRadioGroupProps = useCallback(
    (): RadioGroupProps => ({
      role: 'radiogroup',
      'aria-orientation': orientation,
      'aria-disabled': groupDisabled || undefined,
      'data-orientation': orientation,
    }),
    [orientation, groupDisabled],
  );

  const getRadioProps = useCallback(
    (itemValue: string, itemOptions: GetRadioPropsOptions = {}): RadioProps => {
      const itemDisabled = Boolean(itemOptions.disabled) || groupDisabled;
      const checked = value === itemValue;
      const tabbable = !itemDisabled && itemValue === focusableValue;

      itemsRef.current.set(itemValue, itemDisabled);

      return {
        role: 'radio',
        'aria-checked': checked,
        'aria-disabled': itemDisabled || undefined,
        'data-state': checked ? 'checked' : 'unchecked',
        'data-disabled': itemDisabled ? '' : undefined,
        'data-radio-value': itemValue,
        tabIndex: tabbable ? 0 : -1,
        ref: (node: HTMLElement | null) => {
          if (node) {
            nodesRef.current.set(itemValue, node);
          } else {
            nodesRef.current.delete(itemValue);
          }
        },
        onClick: () => {
          if (itemDisabled) {
            return;
          }
          nodesRef.current.get(itemValue)!.focus();
          setFocusableValue(itemValue);
          setValue(itemValue);
        },
        onKeyDown: (event) => {
          if (groupDisabled) {
            return;
          }
          const direction = keyToDirection(event.key, orientation);
          if (direction === null) {
            return;
          }
          event.preventDefault();
          if (direction === 'select') {
            if (!itemDisabled) {
              setValue(itemValue);
            }
            return;
          }
          move(itemValue, direction);
        },
      };
    },
    [value, focusableValue, groupDisabled, orientation, move, setValue],
  );

  return {
    value,
    name: resolvedName,
    setValue,
    getRadioGroupProps,
    getRadioProps,
  };
}
