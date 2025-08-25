"use client"

import type * as React from "react"
import { BarChart3, Users, Wallet, PiggyBank } from "lucide-react"

import { NavMain } from "@/components/admin/nav-main"
import { NavProjects } from "@/components/admin/nav-projects"
import { NavUser } from "@/components/admin/nav-user"
import { TeamSwitcher } from "@/components/admin/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

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
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "User Management",
      url: "/dashboard",
      icon: Users,
    },
    {
      title: "Savings Management",
      url: "/dashboard",
      icon: Wallet,
    },
  ],
  projects: [], // Remove all quick actions as they don't have implementations
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
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
