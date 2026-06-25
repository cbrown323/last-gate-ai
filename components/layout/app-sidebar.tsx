"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Settings,
  Sparkles,
  BookOpen,
  CalendarDays,
  FileText,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navMain = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Applications", href: "/applications", icon: Boxes },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Notes", href: "/notes", icon: FileText },
  { title: "PM Playbook", href: "/playbook", icon: BookOpen },
];

const navSecondary = [
  { title: "Settings", href: "/settings", icon: Settings },
];

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const navButtonClass =
  "relative h-11 gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary [&_svg]:size-[18px]";

function NavMenu({
  items,
  isActive,
}: {
  items: NavItem[];
  isActive: (href: string) => boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu className="gap-0.5">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={
                <Link
                  href={item.href}
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                />
              }
              isActive={active}
              tooltip={item.title}
              size="lg"
              className={navButtonClass}
            >
              {active ? (
                <span className="bg-primary absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r" />
              ) : null}
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader className="gap-2 border-b border-sidebar-border p-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-orange), var(--brand-teal))",
              boxShadow:
                "0 2px 8px color-mix(in oklab, var(--brand-teal) 30%, transparent), inset 1px 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <Sparkles className="size-4" />
          </div>
          <span className="truncate text-base tracking-wide group-data-[collapsible=icon]:hidden">
            Last Gate AI
          </span>
        </Link>
        <p className="text-muted-foreground text-xs group-data-[collapsible=icon]:hidden">
          Project Intelligence
        </p>
      </SidebarHeader>
      <SidebarContent className="gap-1 overflow-x-hidden px-2 py-3">
        <SidebarGroup className="px-1 py-2">
          <SidebarGroupLabel className="mb-1 h-6 px-2 text-[11px] tracking-wide uppercase">
            Portfolio
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMenu items={navMain} isActive={(href) => pathname.startsWith(href)} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="px-1 py-2">
          <SidebarGroupLabel className="mb-1 h-6 px-2 text-[11px] tracking-wide uppercase">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMenu items={navSecondary} isActive={(href) => pathname === href} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 px-1.5 py-1 group-data-[collapsible=icon]:hidden">
          <div
            className="size-7 shrink-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, var(--brand-orange), var(--brand-teal))",
              boxShadow:
                "0 2px 6px rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.2)",
            }}
          />
          <div className="min-w-0">
            <p className="text-foreground truncate text-xs font-medium">Last Gate AI</p>
            <p className="text-muted-foreground truncate text-[10px]">
              Project Intelligence
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
