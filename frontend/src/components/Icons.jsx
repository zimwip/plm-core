/**
 * Icons — thin re-export of lucide-react with a consistent default size wrapper.
 *
 * Usage:  <PinIcon />  or  <PinIcon size={14} />
 * All lucide icons accept: size, color, strokeWidth, className, style
 */
import {
  Pin, PinOff, X, Plus,
  Pencil, Check, Award, ArrowRight, Undo2, RotateCcw, GitCommit,
  Lock, Hexagon, Settings, Layers, GitBranch, History, FileText, Workflow,
  ChevronRight, ChevronLeft, ChevronDown, Search,
  Circle, AlertTriangle, XCircle,
  Terminal, Copy, Trash2,
  Users, User, Shield,
  BookOpen, Cpu,
  Box, Package, Wrench, Cog, Database, Globe, Clipboard, Tag, FolderOpen,
  Archive, Zap, FlaskConical, Microscope, Component, Blocks,
  Cable, Gauge, Radio, Scan, LayoutDashboard,
  List, Plug, KeyRound, Network,
  Maximize2, Minimize2,
} from 'lucide-react';

export {
  Pin          as PinIcon,
  PinOff       as PinOffIcon,
  X            as CloseIcon,
  Plus         as PlusIcon,

  Pencil       as EditIcon,
  Check        as CheckIcon,
  Award        as SignIcon,
  ArrowRight   as ArrowRightIcon,
  Undo2        as RollbackIcon,
  RotateCcw    as ResetIcon,
  GitCommit    as CommitIcon,

  Lock         as LockIcon,
  Hexagon      as HexIcon,
  Settings     as GearIcon,
  Layers       as LayersIcon,
  GitBranch    as LifecycleIcon,
  History      as HistoryIcon,
  FileText     as FileIcon,
  Workflow     as WorkflowIcon,

  ChevronRight as ChevronRightIcon,
  ChevronLeft  as ChevronLeftIcon,
  ChevronDown  as ChevronDownIcon,
  Search       as SearchIcon,

  Circle       as CircleIcon,
  AlertTriangle as WarnIcon,
  XCircle      as XCircleIcon,

  Terminal     as TerminalIcon,
  Copy         as CopyIcon,
  Trash2       as TrashIcon,

  Users        as UsersIcon,
  User         as UserIcon,
  Shield       as ShieldIcon,

  BookOpen     as BookIcon,
  Cpu          as CpuIcon,
  Zap          as ZapIcon,

  Maximize2    as MaximizeIcon,
  Minimize2    as MinimizeIcon,
};

/**
 * NODE_ICONS — selectable icons for node type definitions.
 * Each key is stored as the node_type.icon value in the database.
 */
export const NODE_ICONS = {
  Box, Package, Cpu, Wrench, Cog, Database, Globe, BookOpen,
  Clipboard, Tag, FolderOpen, Archive, Zap, FlaskConical,
  Microscope, Layers, FileText, GitBranch, Hexagon, Circle,
  Users, Shield, Award, LayoutDashboard, Component, Blocks,
  Cable, Gauge, Radio, Scan,
};

export const NODE_ICON_NAMES = Object.keys(NODE_ICONS);

/**
 * SECTION_ICONS — icon name → component map for settings section navigation.
 * Keys match the `icon` field of {@code SettingSectionDto} declared by each service.
 * LeftPanel resolves the icon dynamically from section.icon — no per-key hardcoding.
 */
export const SECTION_ICONS = {
  user:      User,
  layers:    Layers,
  database:  Database,
  list:      List,
  lifecycle: GitBranch,
  plug:      Plug,
  hexagon:   Hexagon,
  users:     Users,
  shield:    Shield,
  cpu:       Cpu,
  workflow:  Workflow,
  key:       KeyRound,
  network:   Network,
  globe:     Globe,
  terminal:  Terminal,
  book:      BookOpen,
  zap:       Zap,
};
