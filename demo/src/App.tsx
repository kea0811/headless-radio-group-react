import { useState } from 'react';
import { RadioGroup, Radio, useRadioGroup } from 'headless-radio-group-react';

const REPO = 'https://github.com/kea0811/headless-radio-group-react';
const NPM = 'https://www.npmjs.com/package/headless-radio-group-react';

function Hero() {
  return (
    <header className="hero">
      <div className="hero-mark" aria-hidden="true">
        <span className="hero-mark-dot" />
      </div>
      <h1 className="hero-title">headless-radio-group-react</h1>
      <p className="hero-tagline">
        An <strong>accessible, headless</strong> radio group for React. It owns the
        behavior — roving tabindex, keyboard nav and ARIA. You own every pixel.
      </p>
      <div className="hero-pills">
        <span className="pill">React 18 &amp; 19</span>
        <span className="pill">Zero dependencies</span>
        <span className="pill">100% test coverage</span>
        <span className="pill">~1.5 kB gzipped</span>
      </div>
      <pre className="hero-install">
        <code>pnpm add headless-radio-group-react</code>
      </pre>
      <p className="hero-kbd-note">
        Tip: click a radio below, then drive it with{' '}
        <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>Home</kbd>{' '}
        <kbd>End</kbd> <kbd>Space</kbd>.
      </p>
      <div className="hero-links">
        <a className="btn btn-primary" href={NPM} target="_blank" rel="noreferrer">
          npm
        </a>
        <a className="btn" href={REPO} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </header>
  );
}

interface PanelProps {
  title: string;
  blurb: string;
  feature: string;
  selected: string;
  children: React.ReactNode;
}

function Panel({ title, blurb, feature, selected, children }: PanelProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <span className="panel-feature">{feature}</span>
        <h2 className="panel-title">{title}</h2>
        <p className="panel-blurb">{blurb}</p>
      </div>
      <div className="panel-body">{children}</div>
      <div className="panel-foot">
        <span className="panel-foot-label">selected</span>
        <code className="panel-foot-value">{selected || '—'}</code>
      </div>
    </section>
  );
}

const PLANS = [
  { value: 'hobby', name: 'Hobby', price: 'Free', desc: 'For side projects' },
  { value: 'pro', name: 'Pro', price: '$12/mo', desc: 'For indie makers' },
  { value: 'team', name: 'Team', price: '$49/mo', desc: 'For small teams' },
];

function PricingPanel() {
  const [plan, setPlan] = useState('pro');
  return (
    <Panel
      feature="vertical · cards"
      title="Pricing plans"
      blurb="The default: a vertical group where arrow keys also select (the WAI-ARIA default). Style the checked state from data-state."
      selected={plan}
    >
      <RadioGroup
        className="cards"
        aria-label="Plan"
        value={plan}
        onChange={setPlan}
      >
        {PLANS.map((p) => (
          <Radio key={p.value} value={p.value} className="card">
            <span className="card-mark" aria-hidden="true" />
            <span className="card-text">
              <span className="card-name">{p.name}</span>
              <span className="card-desc">{p.desc}</span>
            </span>
            <span className="card-price">{p.price}</span>
          </Radio>
        ))}
      </RadioGroup>
    </Panel>
  );
}

const VIEWS = ['Board', 'Table', 'Timeline'];

function SegmentedPanel() {
  const [view, setView] = useState('Board');
  return (
    <Panel
      feature="horizontal"
      title="Segmented control"
      blurb="Set orientation='horizontal' and Left/Right drive the group. Perfect for view switchers and toolbars."
      selected={view}
    >
      <RadioGroup
        className="segmented"
        aria-label="View"
        orientation="horizontal"
        value={view}
        onChange={setView}
      >
        {VIEWS.map((v) => (
          <Radio key={v} value={v} className="segment">
            {v}
          </Radio>
        ))}
      </RadioGroup>
    </Panel>
  );
}

const SWATCHES = [
  { value: 'indigo', hex: '#7c6cff' },
  { value: 'teal', hex: '#25d0c0' },
  { value: 'amber', hex: '#f5a524' },
  { value: 'rose', hex: '#f31260' },
];

function SwatchPanel() {
  const [color, setColor] = useState('teal');
  return (
    <Panel
      feature="render prop"
      title="Color swatches"
      blurb="A render-prop child receives { checked, disabled } — wire up any custom indicator you like without touching the radio markup."
      selected={color}
    >
      <RadioGroup
        className="swatches"
        aria-label="Accent color"
        orientation="horizontal"
        value={color}
        onChange={setColor}
      >
        {SWATCHES.map((s) => (
          <Radio
            key={s.value}
            value={s.value}
            className="swatch"
            style={{ ['--swatch' as string]: s.hex }}
          >
            {({ checked }) => (
              <span className="swatch-ring" data-checked={checked}>
                <span className="swatch-fill" />
                {checked ? <span className="swatch-check">✓</span> : null}
              </span>
            )}
          </Radio>
        ))}
      </RadioGroup>
    </Panel>
  );
}

const SHIPPING = [
  { value: 'standard', label: 'Standard · 5–7 days' },
  { value: 'express', label: 'Express · 2 days' },
  { value: 'overnight', label: 'Overnight (sold out)', disabled: true },
];

function DisabledPanel() {
  const [ship, setShip] = useState('standard');
  return (
    <Panel
      feature="disabled items"
      title="Disabled options"
      blurb="Disabled radios are announced as such, skipped by the keyboard, and never become the tab stop — exactly as a real radio group should behave."
      selected={ship}
    >
      <RadioGroup className="rows" aria-label="Shipping" value={ship} onChange={setShip}>
        {SHIPPING.map((s) => (
          <Radio key={s.value} value={s.value} className="row" disabled={s.disabled}>
            <span className="row-mark" aria-hidden="true" />
            <span className="row-label">{s.label}</span>
          </Radio>
        ))}
      </RadioGroup>
    </Panel>
  );
}

function ManualCommitPanel() {
  const [answer, setAnswer] = useState('');
  return (
    <Panel
      feature="selectOnFocus = false"
      title="Move first, commit later"
      blurb="Opt out of select-on-focus: arrow keys move focus without changing the answer until you press Space or Enter."
      selected={answer}
    >
      <RadioGroup
        className="rows"
        aria-label="Survey"
        selectOnFocus={false}
        value={answer}
        onChange={setAnswer}
      >
        {['Strongly agree', 'Neutral', 'Strongly disagree'].map((label) => (
          <Radio key={label} value={label} className="row">
            <span className="row-mark" aria-hidden="true" />
            <span className="row-label">{label}</span>
          </Radio>
        ))}
      </RadioGroup>
    </Panel>
  );
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

function HookPanel() {
  // The bare hook: prop getters you spread onto your own elements.
  const group = useRadioGroup({ defaultValue: 'M', orientation: 'horizontal' });
  return (
    <Panel
      feature="useRadioGroup()"
      title="Drive it with the hook"
      blurb="Skip the components entirely. useRadioGroup hands you getRadioGroupProps() and getRadioProps(value) — spread them on whatever you render."
      selected={group.value ?? ''}
    >
      <div {...group.getRadioGroupProps()} className="sizes" aria-label="Size">
        {SIZES.map((size) => (
          <button
            key={size}
            type="button"
            className="size"
            {...group.getRadioProps(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </Panel>
  );
}

const API_ROWS: { name: string; type: string; desc: string }[] = [
  { name: 'value / defaultValue', type: 'string', desc: 'Controlled or uncontrolled selection.' },
  { name: 'onChange', type: '(value) => void', desc: 'Fires when the selection changes.' },
  { name: 'orientation', type: "'vertical' | 'horizontal'", desc: 'Which arrow keys navigate. Default vertical.' },
  { name: 'loop', type: 'boolean', desc: 'Wrap focus past the ends. Default true.' },
  { name: 'selectOnFocus', type: 'boolean', desc: 'Select on arrow focus (ARIA default). Default true.' },
  { name: 'disabled', type: 'boolean', desc: 'Disable the whole group.' },
];

function ApiTable() {
  return (
    <section className="api">
      <h2 className="section-title">The whole API</h2>
      <p className="section-sub">
        Props are shared by both <code>&lt;RadioGroup&gt;</code> and{' '}
        <code>useRadioGroup()</code>. Per-radio you only pass a <code>value</code> and
        an optional <code>disabled</code>.
      </p>
      <div className="api-table" role="table" aria-label="Options">
        <div className="api-row api-row-head" role="row">
          <span className="api-cell" role="columnheader">Option</span>
          <span className="api-cell" role="columnheader">Type</span>
          <span className="api-cell" role="columnheader">What it does</span>
        </div>
        {API_ROWS.map((row) => (
          <div className="api-row" role="row" key={row.name}>
            <code className="api-cell api-name" role="cell">{row.name}</code>
            <code className="api-cell api-type" role="cell">{row.type}</code>
            <span className="api-cell api-desc" role="cell">{row.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const USAGE = `import { RadioGroup, Radio } from 'headless-radio-group-react';

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

/* Style the checked state with the data attributes it sets: */
/* [role="radio"][data-state="checked"] { ... } */`;

function Usage() {
  return (
    <section className="usage">
      <h2 className="section-title">Five-second integration</h2>
      <p className="section-sub">
        No styles ship with the library — bring your own CSS and target the{' '}
        <code>data-state</code> / <code>data-disabled</code> attributes.
      </p>
      <pre className="code-block">
        <code>{USAGE}</code>
      </pre>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-line">
        MIT licensed · built by{' '}
        <a className="footer-link" href="https://github.com/kea0811" target="_blank" rel="noreferrer">
          kea0811
        </a>
      </p>
      <p className="footer-sub">
        <a className="footer-link" href={NPM} target="_blank" rel="noreferrer">npm</a>
        {' · '}
        <a className="footer-link" href={REPO} target="_blank" rel="noreferrer">source</a>
      </p>
    </footer>
  );
}

export function App() {
  return (
    <div className="page">
      <div className="glow" aria-hidden="true" />
      <main className="shell">
        <Hero />
        <div className="grid">
          <PricingPanel />
          <SegmentedPanel />
          <SwatchPanel />
          <DisabledPanel />
          <ManualCommitPanel />
          <HookPanel />
        </div>
        <ApiTable />
        <Usage />
        <Footer />
      </main>
    </div>
  );
}
