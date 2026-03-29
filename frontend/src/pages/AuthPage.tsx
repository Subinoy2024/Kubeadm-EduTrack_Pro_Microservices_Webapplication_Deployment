import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading, refreshUser } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const dest =
        role === "admin"
          ? "/admin"
          : role === "teacher"
          ? "/teacher"
          : "/student";
      navigate(dest, { replace: true });
    }
  }, [user, role, loading, navigate]);

  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginRole, setLoginRole] = useState("student");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.auth.login(loginData.email, loginData.password);

      if (!res.success || !res.data) {
        toast({
          title: "Login failed",
          description: res.error || "Invalid credentials",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      api.setTokens(res.data.accessToken, res.data.refreshToken);

      await refreshUser();

      const backendRole =
        res.data.user?.role ||
        loginRole ||
        "student";

      const dest =
        backendRole === "admin"
          ? "/admin"
          : backendRole === "teacher"
          ? "/teacher"
          : "/student";

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      navigate(dest, { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error?.message || "Something went wrong during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary-foreground">
              EduTrack Pro
            </span>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            Smart Learning.
            <br />
            Measurable Progress.
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-md mx-auto">
            Join thousands of students and teachers transforming education with AI-powered learning.
          </p>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EduTrack Pro</span>
          </Link>

          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Welcome back</h2>
              <p className="text-muted-foreground">
                Select your role and enter your credentials
              </p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "student", label: "Student", icon: "🎓" },
                { value: "teacher", label: "Teacher", icon: "📚" },
                { value: "admin", label: "Admin", icon: "🛡️" },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setLoginRole(r.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition-all ${
                    loginRole === r.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <span className="text-sm font-medium">{r.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading
                  ? "Logging in..."
                  : `Log In as ${loginRole.charAt(0).toUpperCase() + loginRole.slice(1)}`}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Contact your administrator to get your login credentials.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}