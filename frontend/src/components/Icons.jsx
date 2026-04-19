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

  // Copy / Duplicate
  Copy         as CopyIcon,

  // Destructive
  Trash2       as TrashIcon,

  // Users & Roles
  Users        as UsersIcon,
  User         as UserIcon,
  Shield       as ShieldIcon,

  // Manual / Help
  BookOpen     as BookIcon,

  // Algorithms
  Cpu          as CpuIcon,
} from 'lucide-react';

/**
 * NODE_ICONS — selectable icons for node type definitions.
 * Each key is stored as the node_type.icon value in the database.
 */
import {
  Box, Package, Cpu, Wrench, Cog, Database, Globe, BookOpen,
  Clipboard, Tag, FolderOpen, Archive, Zap, FlaskConical,
  Microscope, Layers, FileText, GitBranch, Hexagon, Circle,
  Users, Shield, Award, LayoutDashboard, Component, Blocks,
  Cable, Gauge, Radio, Scan,
} from 'lucide-react';

export const NODE_ICONS = {
  Box,
  Package,
  Cpu,
  Wrench,
  Cog,
  Database,
  Globe,
  BookOpen,
  Clipboard,
  Tag,
  FolderOpen,
  Archive,
  Zap,
  FlaskConical,
  Microscope,
  Layers,
  FileText,
  GitBranch,
  Hexagon,
  Circle,
  Users,
  Shield,
  Award,
  LayoutDashboard,
  Blocks,
  Cable,
  Gauge,
  Radio,
  Scan,
};

export const NODE_ICON_NAMES = Object.keys(NODE_ICONS);
