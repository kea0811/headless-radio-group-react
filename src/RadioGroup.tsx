import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  type Ref,
} from 'react';
import { useRadioGroup } from './useRadioGroup';
import type {
  RadioComponentProps,
  RadioGroupComponentProps,
  UseRadioGroupResult,
} from './types';

interface RadioGroupContextValue {
  getRadioProps: UseRadioGroupResult['getRadioProps'];
  value: string | undefined;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext(component: string): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);
  if (context === null) {
    throw new Error(`<${component}> must be rendered inside a <RadioGroup>.`);
  }
  return context;
}

/** Compose any number of refs (function or object) into a single callback ref. */
function mergeRefs(...refs: Ref<HTMLElement>[]) {
  return (node: HTMLElement | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref != null) {
        (ref as { current: HTMLElement | null }).current = node;
      }
    }
  };
}

/**
 * Ergonomic wrapper around {@link useRadioGroup}. Renders a `radiogroup`
 * container and shares behavior with descendant `<Radio>`s via context.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupComponentProps>(
  function RadioGroup(props, forwardedRef) {
    const {
      value,
      defaultValue,
      onChange,
      name,
      orientation,
      loop,
      disabled,
      selectOnFocus,
      children,
      ...rest
    } = props;

    const group = useRadioGroup({
      value,
      defaultValue,
      onChange,
      name,
      orientation,
      loop,
      disabled,
      selectOnFocus,
    });

    const context = useMemo<RadioGroupContextValue>(
      () => ({ getRadioProps: group.getRadioProps, value: group.value }),
      [group.getRadioProps, group.value],
    );

    return (
      <RadioGroupContext.Provider value={context}>
        <div {...rest} {...group.getRadioGroupProps()} ref={forwardedRef}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

/**
 * A single selectable radio. Style it with the `data-state` /
 * `data-disabled` attributes, or read live state via a render-prop child.
 */
export const Radio = forwardRef<HTMLDivElement, RadioComponentProps>(
  function Radio(props, forwardedRef) {
    const { value, disabled, children, ...rest } = props;
    const { getRadioProps, value: selectedValue } = useRadioGroupContext('Radio');

    const { ref: radioRef, ...radioProps } = getRadioProps(value, { disabled });
    const checked = selectedValue === value;
    const content =
      typeof children === 'function'
        ? children({ checked, disabled: Boolean(disabled) })
        : children;

    return (
      <div {...rest} {...radioProps} ref={mergeRefs(forwardedRef, radioRef)}>
        {content}
      </div>
    );
  },
);
