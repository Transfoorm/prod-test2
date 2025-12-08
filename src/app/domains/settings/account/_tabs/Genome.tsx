'use client';

import { useFuse } from '@/store/fuse';
import { Field } from '@/prebuilts';

export default function Genome() {
  const user = useFuse((s) => s.user);
  const updateUserLocal = useFuse((s) => s.updateUserLocal);

  return (
    <div className="vr-field-spacing">
      <div className="ft-field-row">
        <Field.verify
          label="Job Title"
          value={user?.jobTitle ?? ''}
          onCommit={async (v) => {
            await updateUserLocal({ jobTitle: v || undefined });
          }}
          placeholder="e.g. Software Engineer"
        />
      </div>
    </div>
  );
}
