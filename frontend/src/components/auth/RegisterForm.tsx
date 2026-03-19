"use client"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Basic Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }
    if (!email || !password || !confirmPassword || !fullName) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    if (password != confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Registering the User
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        console.error("Error signing up:", signUpError);
        setError(signUpError.message);
        throw signUpError;
      }
      if (signUpData.session && signUpData.user){
        const {error: profileError} = await supabase
          .from("profiles")
          .insert({
            id: signUpData.user.id,
            full_name: fullName,
          })
          if (profileError){
            console.error("Error creating profile up:", profileError);
            setError(profileError.message);
            return;
          }
          toast.success("Registration is successful. Welcome to ScholarSync");
          router.push("/profile");
          return;
      }
      toast.success("Registration is Successful! Please check your email to verify your account");
      setIsLoading(false);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleRegister} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to register
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="full-name">Full Name</Label>
          <Input id="full-name" type="text" placeholder="John Doe" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        {isLoading && <p>Loading...</p>}
        <Button type="submit" className="w-full">
          Register
        </Button>
        {/* 
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        
        <Button variant="outline" className="w-full gap-2 text-sm">
          Sign up with GitHub
        </Button>
         */}
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </form>
  )
}
