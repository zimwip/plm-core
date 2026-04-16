/**
 * Module-level drag state for PLM node drag-and-drop.
 *
 * dataTransfer.types / getData() are unreliable on Linux/Wayland (custom MIME
 * types are not exposed during dragenter/dragover, so e.preventDefault() is
 * never called and the drop is silently swallowed).
 *
 * Storing the in-flight payload here sidesteps that limitation entirely.
 */

let _draggedNode = null;

export function setDraggedNode(data) { _draggedNode = data; }
export function clearDraggedNode()   { _draggedNode = null; }
export function getDraggedNode()     { return _draggedNode; }
