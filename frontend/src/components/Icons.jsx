/**
 * Icons — thin re-export of lucide-react with a consistent default size wrapper.
 *
 * Usage:  <PinIcon />  or  <PinIcon size={14} />
 * All lucide icons accept: size, color, strokeWidth, className, style
 */
export {
  // Tab management
  Pin          as PinIcon,
  PinOff       as PinOffIcon,
  X            as CloseIcon,
  Plus         as PlusIcon,

  // Actions
  Pencil       as EditIcon,
  Check        as CheckIcon,
  Award        as SignIcon,
  ArrowRight   as ArrowRightIcon,
  Undo2        as RollbackIcon,
  RotateCcw    as ResetIcon,
  GitCommit    as CommitIcon,

  // State / metadata
  Lock         as LockIcon,
  Hexagon      as HexIcon,
  Settings     as GearIcon,
  Layers       as LayersIcon,
  GitBranch    as LifecycleIcon,
  History      as HistoryIcon,
  FileText     as FileIcon,
  Workflow     as WorkflowIcon,

  // Navigation
  ChevronRight as ChevronRightIcon,
  ChevronDown  as ChevronDownIcon,
  Search       as SearchIcon,

  // Status
  Circle       as CircleIcon,
  AlertTriangle as WarnIcon,
  XCircle      as XCircleIcon,

  // API Playground
  Terminal     as TerminalIcon,

  // Destructive
  Trash2       as TrashIcon,

  // Users & Roles
  Users        as UsersIcon,
  User         as UserIcon,
  Shield       as ShieldIcon,
} from 'lucide-react';
