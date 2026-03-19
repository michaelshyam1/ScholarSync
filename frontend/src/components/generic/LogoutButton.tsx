import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (!error) {
      router.push("/auth/login");
    } else {
      // Optionally handle error
      alert("Logout failed");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Logout"
      onClick={handleLogOut}
      disabled={loading}
      className="w-10 h-10 flex items-center justify-center mx-auto"
    >
      {loading ? (
        <Loader2 data-testid="loader" className="h-5 w-5 animate-spin" />
      ) : (
        <LogOut className="h-5 w-5" />
      )}
    </Button>
  );
}
