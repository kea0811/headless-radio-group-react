import type {
  HTMLAttributes,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  RefCallback,
} from 'react';

/** Layout axis of the group — controls which arrow keys move between radios. */
export type RadioGroupOrientation = 'horizontal' | 'vertical';

/** Options accepted by {@link useRadioGroup}. */
export interface UseRadioGroupOptions {
  /** Controlled selected value. Pass together with `onChange`. */
  value?: string;
  /** Initial value for uncontrolled usage. Ignored when `value` is provided. */
  defaultValue?: string;
  /** Called with the next value whenever the selection changes. */
  onChange?: (value: string) => void;
  /**
   * Name for the group — handy if you render hidden `<input>`s for form
   * submission. Auto-generated with `useId` when omitted.
   */
  name?: string;
  /** Arrow-key axis. Defaults to `'vertical'`. */
  orientation?: RadioGroupOrientation;
  /** Wrap focus from last→first (and first→last). Defaults to `true`. */
  loop?: boolean;
  /** Disable the whole group: nothing is focusable or selectable. */
  disabled?: boolean;
  /**
   * Select a radio as soon as it receives focus via arrow keys (the WAI-ARIA
   * default). Set to `false` to require Space/Enter to commit. Defaults to `true`.
   */
  selectOnFocus?: boolean;
}

/** Props to spread onto the element that wraps the radios. */
export interface RadioGroupProps {
  role: 'radiogroup';
  'aria-orientation': RadioGroupOrientation;
  'aria-disabled': true | undefined;
  'data-orientation': RadioGroupOrientation;
}

/** Per-item options for {@link UseRadioGroupResult.getRadioProps}. */
export interface GetRadioPropsOptions {
  /** Disable just this radio. */
  disabled?: boolean;
}

/** Props to spread onto each radio element. */
export interface RadioProps {
  role: 'radio';
  'aria-checked': boolean;
  'aria-disabled': true | undefined;
  'data-state': 'checked' | 'unchecked';
  'data-disabled': '' | undefined;
  'data-radio-value': string;
  tabIndex: 0 | -1;
  /** Callback ref — spreads cleanly onto any intrinsic element. */
  ref: RefCallback<HTMLElement>;
  onClick: MouseEventHandler<HTMLElement>;
  onKeyDown: KeyboardEventHandler<HTMLElement>;
}

/** Everything {@link useRadioGroup} returns. */
export interface UseRadioGroupResult {
  /** The currently selected value, or `undefined` when nothing is selected. */
  value: string | undefined;
  /** Resolved group name (provided or auto-generated). */
  name: string;
  /** Imperatively set the selection (respects controlled mode). */
  setValue: (value: string) => void;
  /** Spread onto the wrapper element. */
  getRadioGroupProps: () => RadioGroupProps;
  /** Spread onto each radio element. */
  getRadioProps: (value: string, options?: GetRadioPropsOptions) => RadioProps;
}

/** Render-prop state handed to a {@link Radio} child function. */
export interface RadioRenderState {
  checked: boolean;
  disabled: boolean;
}

/** Props for the `<RadioGroup>` component. */
export interface RadioGroupComponentProps
  extends UseRadioGroupOptions,
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  children?: ReactNode;
}

/** Props for the `<Radio>` component. */
export interface RadioComponentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The value this radio represents. Must be unique within the group. */
  value: string;
  /** Disable just this radio. */
  disabled?: boolean;
  /** Static content, or a render function receiving `{ checked, disabled }`. */
  children?: ReactNode | ((state: RadioRenderState) => ReactNode);
}
