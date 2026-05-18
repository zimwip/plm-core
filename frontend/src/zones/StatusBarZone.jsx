import React from 'react';
import StatusBar from '../components/StatusBar';
import { useShellStore } from '../shell/shellStore';

function BgJobsChip() {
  const bgJobs = useShellStore(s => s.bgJobs);
  if (bgJobs.length === 0) return null;
  return (
    <>
      {bgJobs.map(job => {
        const done   = job.status === 'done' || job.status === 'failed';
        const failed = job.status === 'failed';
        return (
          <button
            key={job.id}
            className="bg-job-chip"
            onClick={job.onOpen}
            title={`${job.label} — click to view`}
          >
            <span
              className={`bg-job-dot${!done ? ' bg-job-dot-pulse' : ''}`}
              style={{ background: failed ? '#fc8181' : done ? '#4dd4a0' : 'var(--accent)' }}
            />
            <span>{job.label}{done ? (failed ? ' — Failed' : ' — Done') : '…'}</span>
          </button>
        );
      })}
    </>
  );
}

export default function StatusBarZone(props) {
  const statusSlots    = useShellStore(s => s.statusSlots);
  const consoleVisible = useShellStore(s => s.consoleVisible);
  const toggleConsole  = useShellStore(s => s.toggleConsole);
  const leftSlots      = [
    { id: '_bg-jobs', Component: BgJobsChip, position: 'left' },
    ...statusSlots.filter(s => s.position !== 'right'),
  ];
  const rightSlots     = statusSlots.filter(s => s.position === 'right');

  return (
    <StatusBar
      {...props}
      leftSlots={leftSlots}
      rightSlots={rightSlots}
      consoleVisible={consoleVisible}
      onToggleConsole={toggleConsole}
    />
  );
}
