import {
  Activity,
  BellRing,
  Boxes,
  Building2,
  ChartColumn,
  FileCheck2,
  FlaskConical,
  Globe,
  LayoutDashboard,
  Palette,
  QrCode,
  Smartphone,
  Rocket,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  UploadCloud,
  Users
} from "lucide-react";
import type { ComponentType } from "react";
import { Role } from "@/types/auth";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [Role.MANAGER] },
  { href: "/products", label: "Products", icon: Boxes, roles: [Role.MANAGER, Role.STORE_KEEPER] },
  { href: "/warehouses", label: "Warehouses", icon: Building2, roles: [Role.MANAGER] },
  { href: "/operations", label: "Operations", icon: ShoppingCart, roles: [Role.MANAGER] },
  { href: "/alerts", label: "Alerts", icon: BellRing, roles: [Role.MANAGER, Role.STORE_KEEPER] },
  { href: "/forecast", label: "Forecast", icon: ChartColumn, roles: [Role.MANAGER] },
  { href: "/audit", label: "Audit", icon: FileCheck2, roles: [Role.MANAGER] },
  { href: "/media", label: "Media", icon: UploadCloud, roles: [Role.MANAGER, Role.STORE_KEEPER] },
  { href: "/scan", label: "Scanner", icon: QrCode, roles: [Role.MANAGER, Role.STORE_KEEPER] },
  { href: "/pwa", label: "PWA", icon: Smartphone, roles: [Role.MANAGER, Role.STORE_KEEPER] },
  { href: "/permissions", label: "Permissions", icon: ShieldCheck, roles: [Role.MANAGER] },
  { href: "/localization", label: "Localization", icon: Globe, roles: [Role.MANAGER] },
  { href: "/collaboration", label: "Collaboration", icon: Users, roles: [Role.MANAGER, Role.STORE_KEEPER] },
  { href: "/analytics", label: "Analytics", icon: Activity, roles: [Role.MANAGER] },
  { href: "/integrations", label: "Integrations", icon: Settings2, roles: [Role.MANAGER] },
  { href: "/release-controls", label: "Release", icon: Rocket, roles: [Role.MANAGER] },
  { href: "/quality", label: "Quality", icon: FlaskConical, roles: [Role.MANAGER] },
  { href: "/design-system", label: "Design System", icon: Palette, roles: [Role.MANAGER] }
];
