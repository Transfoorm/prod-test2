'use client';

import { Card } from '@/prebuilts/card';

export default function Guide() {
  return (
    <Card.standard
      title="The VR Doctrine"
      subtitle="Everything you need to know about Variant Robots"
    >
      <div className="ft-showcasetabs-guide">
        <p className="ft-showcasetabs-guide-intro">
          <strong>Variant Robots (VRs)</strong> are the DNA of this application.
          They&apos;re dumb, beautiful, reusable UI shells that know nothing about
          your data — and that&apos;s exactly what makes them powerful.
        </p>

        <h3>The Stack</h3>
        <pre className="ft-showcasetabs-guide-code">VR → Feature → Tab</pre>
        <ul>
          <li><strong>VR</strong> — Pure UI. Receives value, fires callback. No FUSE. No logic.</li>
          <li><strong>Feature</strong> — Wires VRs to FUSE. Handles transforms, edge cases, all the dirt.</li>
          <li><strong>Tab</strong> — One line import. Zero state. Just places Features on the page.</li>
        </ul>

        <h3>The Sponge Principle</h3>
        <p>
          Features are the sponge — they absorb all complexity so VRs stay dry (reusable)
          and Tabs stay pristine (declarative). When you&apos;re unsure where code belongs,
          ask: <em>&quot;Is this dirt?&quot;</em> If yes, it goes in a Feature.
        </p>

        <h3>CSS Prefixes</h3>
        <ul>
          <li><code>.vr-*</code> — Prebuilts only (reusable DNA)</li>
          <li><code>.ft-*</code> — Features only (specific assembly)</li>
          <li>Tabs have <strong>no CSS</strong> — they just compose</li>
        </ul>

        <h3>The Ontology (Bottom Up)</h3>
        <p className="ft-showcasetabs-guide-ontology">
          byte → character → token → declaration → class → structure →
          behavior → variant surface → <strong>VR</strong> → section → screen → app
        </p>
        <p>
          A VR sits at the sweet spot: styling + structure + behavior + variants,
          sealed into one predictable, portable unit. Everything below is encapsulated.
          Everything above just composes it.
        </p>

        <h3>Deep Dive Documentation</h3>
        <ul className="ft-showcasetabs-guide-links">
          <li>
            <code>_sdk/VR-DOCTRINE.md</code>
            <span>The complete philosophy, examples, and ontology stack</span>
          </li>
          <li>
            <code>.claude/commands/VR-devcheck.md</code>
            <span>Quick layer checks before writing code</span>
          </li>
          <li>
            <code>.claude/commands/VR-class-scanner.md</code>
            <span>CSS namespace isolation and collision prevention</span>
          </li>
          <li>
            <code>.claude/commands/VRP-audit.md</code>
            <span>88-point FUSE compliance audit</span>
          </li>
        </ul>
      </div>
    </Card.standard>
  );
}
