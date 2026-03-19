"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { BookOpen, User, ClipboardList, MessageCircle } from "lucide-react"
import { LogoutButton } from "./LogoutButton"

export default function SideNav() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)

  const navItems = [
    { href: "/profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { href: "/scholarships", label: "Scholarships", icon: <BookOpen className="w-5 h-5" /> },
    { href: "/apply", label: "My Applications", icon: <ClipboardList className="w-5 h-5" /> },
    { href: "/forum", label: "Forum", icon: <MessageCircle className="w-5 h-5" /> },

  ]

  return (
    <nav
      className={cn(
        "flex flex-col bg-white shadow transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      style={{ minHeight: "100vh" }}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex p-3 transition-colors duration-200 hover:bg-gray-100",
            collapsed ? "justify-center items-center w-full" : "justify-start items-center gap-3",
            pathname === item.href && "bg-gray-200 font-semibold"
          )}
        >
          {item.icon}
          {!collapsed && (
            <span className="whitespace-nowrap overflow-hidden transition-all duration-300 opacity-100 max-w-[200px]">
              {item.label}
            </span>
          )}
        </Link>
      ))}
      <div className="flex-grow" />
      <div className="p-3">
        <LogoutButton />
      </div>
    </nav>
  )
}