import {
  LayoutDashboard,
  Users,
  Eye,
  Calendar,
  Package,
  ShoppingCart,
  FlaskConical,
  Wallet,
  FileText,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Eye,
  Calendar,
  Package,
  ShoppingCart,
  FlaskConical,
  Wallet,
  FileText,
  BarChart3,
  Settings,
};

interface IconProps {
  name: string;
  className?: string;
}

export function ModuleIcon({ name, className }: IconProps) {
  const Icon = iconMap[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}
