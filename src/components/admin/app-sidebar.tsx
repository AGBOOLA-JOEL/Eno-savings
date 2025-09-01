"use client";

import type * as React from "react";
import {
  BarChart3,
  Users,
  Wallet,
  PiggyBank,
  TrendingUp,
  UserPlus,
  Activity,
  CreditCard,
  FileText,
  DollarSign,
} from "lucide-react";

import { NavMain } from "@/components/admin/nav-main";
import { NavProjects } from "@/components/admin/nav-projects";
import { NavUser } from "@/components/admin/nav-user";
import { TeamSwitcher } from "@/components/admin/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "Admin User",
    email: "admin@enosavings.com",
    avatar: "/placeholder-user.jpg",
  },
  teams: [
    {
      name: "Eno Savings",
      logo: PiggyBank,
      plan: "Admin Panel",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/dashboard?tab=overview",
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard?tab=overview",
        },
        {
          title: "Analytics",
          url: "/dashboard?tab=analytics",
        },
      ],
    },
    {
      title: "User Management",
      url: "/dashboard?tab=users",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: "/dashboard?tab=users",
        },
        {
          title: "Add User",
          url: "/dashboard?tab=users&action=add",
        },
        {
          title: "User Reports",
          url: "/dashboard?tab=users&view=reports",
        },
      ],
    },
    {
      title: "Savings Management",
      url: "/dashboard?tab=savings",
      icon: Wallet,
      items: [
        {
          title: "All Savings",
          url: "/dashboard?tab=savings",
        },
        {
          title: "Add Entry",
          url: "/dashboard?tab=savings&action=add",
        },
        {
          title: "Transactions",
          url: "/dashboard?tab=savings&view=transactions",
        },
      ],
    },
    {
      title: "Withdrawal Management",
      url: "/dashboard?tab=withdrawals",
      icon: DollarSign,
      items: [
        {
          title: "Withdrawals",
          url: "/dashboard?tab=withdrawals",
        },
        {
          title: "Withdrawal History",
          url: "/dashboard?tab=withdrawals&view=history",
        },
      ],
    },
    {
      title: "Reports",
      url: "/dashboard?tab=reports",
      icon: FileText,
      items: [
        {
          title: "Financial Reports",
          url: "/dashboard?tab=reports&type=financial",
        },
        {
          title: "User Activity",
          url: "/dashboard?tab=reports&type=activity",
        },
        {
          title: "Export Data",
          url: "/dashboard?tab=reports&action=export",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Quick Actions",
      url: "/dashboard?tab=overview",
      icon: Activity,
    },
    {
      name: "Add New User",
      url: "/dashboard?tab=users&action=add",
      icon: UserPlus,
    },
    {
      name: "Add Savings",
      url: "/dashboard?tab=savings&action=add",
      icon: CreditCard,
    },
    {
      name: "View Analytics",
      url: "/dashboard?tab=analytics",
      icon: TrendingUp,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentUser?: {
    name: string | null;
    email: string | null;
  };
}

export function AppSidebar({ currentUser, ...props }: AppSidebarProps) {
  const userData = currentUser
    ? {
        name: currentUser.name || "Admin User",
        email: currentUser.email || "admin@enosavings.com",
        avatar: "/placeholder-user.jpg",
      }
    : data.user;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
