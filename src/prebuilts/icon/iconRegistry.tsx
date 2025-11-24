/**──────────────────────────────────────────────────────────────────────┐
│  🤖 ICON UTILITY - Lucide React Wrapper                                │
│  /src/components/ui/icon/index.tsx                                     │
│                                                                        │
│  Simple wrapper around Lucide icons with size variants.                │
│                                                                        │
│  Usage:                                                                │
│  import { Icon } from '@/prebuilts';                       │
│  <Icon variant="chevron-right" size="md" />                           │
└────────────────────────────────────────────────────────────────────────┘ */

"use client";

import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronsLeftRight,
  ChevronsRightLeft,
  ChevronsUp,
  ChevronsDown,
  CirclePlus,
  CircleMinus,
  Layers,
  PanelRightClose,
  ArrowLeft,
  ArrowRight,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Expand,
  Minimize2,
  Maximize2,
  Eye,
  EyeOff,
  Home,
  LayoutDashboard,
  Users,
  User,
  UserCog,
  CircleUser,
  CircleUserRound,
  Handshake,
  HandCoins,
  FileText,
  BarChart3,
  TrendingUp,
  ChartScatter,
  ChartBarStacked,
  LassoSelect,
  LocateFixed,
  Briefcase,
  Calendar,
  CalendarCheck2,
  DollarSign,
  Receipt,
  CreditCard,
  Settings,
  Cog,
  Sliders,
  Sparkles,
  Palette,
  Building2,
  Mail,
  Lock,
  LogOut,
  Pencil,
  Trash2,
  Search,
  Activity,
  Video,
  Camera,
  Wrench,
  Speech,
  TableProperties,
  X,
  SquareX,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Flame,
  Flag,
  Gem,
  PackageOpen,
} from 'lucide-react';

// Icon registry - maps string variants to Lucide components
const iconRegistry = {
  // Navigation chevrons
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  'chevrons-left': ChevronsLeft,
  'chevrons-right': ChevronsRight,
  'chevrons-up': ChevronsUp,
  'chevrons-down': ChevronsDown,
  'chevrons-expand': ChevronsLeftRight,
  'chevrons-contract': ChevronsRightLeft,

  // Circle controls
  'circle-plus': CirclePlus,
  'circle-minus': CircleMinus,

  // Panel controls
  'layers': Layers,
  'panel-close': PanelRightClose,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-big-left': ArrowBigLeft,
  'arrow-big-right': ArrowBigRight,
  'arrow-left-from-line': ArrowLeftFromLine,
  'arrow-right-from-line': ArrowRightFromLine,
  'panel-left-close': Expand,
  'panel-right-close': Minimize2,
  'maximize-2': Maximize2,
  'eye': Eye,
  'eye-off': EyeOff,

  // Navigation icons
  'home': Home,
  'layout-dashboard': LayoutDashboard,
  'users': Users,
  'user': User,
  'user-star': UserCog,
  'circle-user': CircleUser,
  'circle-user-round': CircleUserRound,
  'handshake': Handshake,
  'hand-coins': HandCoins,
  'file-text': FileText,
  'bar-chart': BarChart3,
  'trending-up': TrendingUp,
  'chart-scatter': ChartScatter,
  'chart-bar-stacked': ChartBarStacked,
  'briefcase': Briefcase,
  'calendar': Calendar,
  'calendar-check-2': CalendarCheck2,
  'dollar-sign': DollarSign,
  'receipt': Receipt,
  'credit-card': CreditCard,
  'settings': Settings,
  'cog': Cog,
  'sliders': Sliders,
  'sparkles': Sparkles,
  'palette': Palette,
  'building': Building2,
  'mail': Mail,
  'lock': Lock,
  'logout': LogOut,
  'activity': Activity,
  'video': Video,
  'wrench': Wrench,
  'speech': Speech,
  'table-properties': TableProperties,

  // Actions
  'pencil': Pencil,
  'trash': Trash2,
  'search': Search,
  'camera': Camera,
  'x': X,
  'square-x': SquareX,
  'lasso-select': LassoSelect,
  'locate-fixed': LocateFixed,

  // Alerts & Status
  'info': Info,
  'check': CheckCircle,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'warning': AlertTriangle,
  'flame': Flame,
  'flag': Flag,
  'gem': Gem,
  'package': PackageOpen,
} as const;

export type IconVariant = keyof typeof iconRegistry;
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Size mapping: semantic names to pixel values
const sizeMap: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

interface IconProps {
  variant: IconVariant;
  size?: IconSize;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Icon - Lucide React wrapper with semantic size variants
 *
 * Features:
 * - Predefined icon registry
 * - 5 size variants (xs, sm, md, lg, xl) mapped to pixel values
 * - Direct prop passing (TTT-compliant, zero runtime overhead)
 * - Custom className support
 *
 * TTT Compliance:
 * - Uses Lucide's native size prop (no CSS indirection)
 * - Static size mapping (no runtime computation)
 * - Zero className string concatenation overhead
 *
 * Note: This is a utility component, not a full VRS component.
 * Icons are consumed by variant name, not as separate robot components.
 */
export function Icon({ variant, size = 'sm', className = '', style }: IconProps) {
  const IconComponent = iconRegistry[variant];

  if (!IconComponent) {
    console.error(`Icon variant "${variant}" not found in registry`);
    return null;
  }

  return (
    <IconComponent
      size={sizeMap[size]}
      strokeWidth={2}
      className={className}
      style={style}
    />
  );
}
