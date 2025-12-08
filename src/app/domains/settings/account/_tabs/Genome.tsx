'use client';

import { Field } from '@/prebuilts';

export default function Genome() {
  return (
    <div className="vr-field-spacing">
      <div className="ft-field-row">
        <Field.verify field="jobTitle" label="Job Title" placeholder="e.g. Software Engineer" />
      </div>
    </div>
  );
}
