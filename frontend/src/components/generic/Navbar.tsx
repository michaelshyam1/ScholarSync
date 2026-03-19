"use client"
import Link from "next/link"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User as SupabaseUser } from "@supabase/supabase-js"
const supabase = createClient()

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const router = useRouter()
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        setUser(null)
        return
      }
      setUser(data.user)
    }

    fetchUser()

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
      return
    }
    setUser(null)
    router.push("/auth/login")
  }

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-[#fdf1dc] shadow">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🎓</span>
        <Link href="/" className="text-2xl font-bold text-gray-800">
          <h1 className="text-xl font-serif font-semibold">ScholarSync</h1>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-4">
        <Link href="/">Home</Link>
        {!user ? (
          <>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/register">Register</Link>
          </>
        ) : (
          <>
            <Link href="/profile">Profile</Link>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </>
        )}
      </nav>
      {/* Mobile Navigation */}
      <>
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/">Home</Link>
              </DropdownMenuItem>
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/register">Register</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    </header>
  )
}