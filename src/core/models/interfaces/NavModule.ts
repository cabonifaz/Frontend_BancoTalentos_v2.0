import { LucideIcon } from "lucide-react";

export interface NavModule {
  key: string;
  icon: LucideIcon;
  label: string;
  path: string;
  roles: number[];
}