export function isStepLink(link) {
  const ct   = (link.targetDetails?.contentType || '').toLowerCase();
  const name = (link.displayKey || link.targetKey || '').toLowerCase();
  return ct.includes('step') || ct.includes('stp') ||
         name.endsWith('.stp') || name.endsWith('.step') || name.endsWith('.p21');
}
