"use client"

import type * as React from "react"
import { BarChart3, Users, Wallet, PiggyBank, Home, FileText } from "lucide-react"

import { NavMain } from "@/components/admin/nav-main"
import { NavUser } from "@/components/admin/nav-user"
import { TeamSwitcher } from "@/components/admin/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

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
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Overview",
      url: "/dashboard?tab=overview",
      icon: BarChart3,
      items: [
        {
          title: "Analytics",
          url: "/dashboard?tab=overview",
        },
        {
          title: "Statistics",
          url: "/dashboard?tab=overview&view=stats",
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
          title: "Add New User",
          url: "/dashboard?tab=users&action=add",
        },
        {
          title: "User Analytics",
          url: "/dashboard?tab=users&view=analytics",
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
          title: "Add Savings Entry",
          url: "/dashboard?tab=savings&action=add",
        },
        {
          title: "Savings Analytics",
          url: "/dashboard?tab=savings&view=analytics",
        },
      ],
    },
    {
      title: "Reports",
      url: "/dashboard?tab=reports",
      icon: FileText,
      items: [
        {
          title: "User Reports",
          url: "/dashboard?tab=reports&type=users",
        },
        {
          title: "Savings Reports",
          url: "/dashboard?tab=reports&type=savings",
        },
        {
          title: "Financial Summary",
          url: "/dashboard?tab=reports&type=financial",
        },
      ],
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentUser?: {
    name: string | null
    email: string | null
  }
}

export function AppSidebar({ currentUser, ...props }: AppSidebarProps) {
  const userData = currentUser
    ? {
        name: currentUser.name || "Admin User",
        email: currentUser.email || "admin@enosavings.com",
        avatar: "/placeholder-user.jpg",
      }
    : data.user

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
