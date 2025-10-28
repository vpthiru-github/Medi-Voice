import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Stethoscope,
  Shield,
  Heart,
  Activity,
  Brain,
  UserCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI, tokenHelper, healthAPI } from "@/lib/api";

const LoginEnhanced = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [demoMode, setDemoMode] = useState(import.meta.env.VITE_DEMO_MODE === 'true');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check API connection on component mount
  useState(() => {
    checkAPIConnection();
  });

  const checkAPIConnection = async () => {
    try {
      await healthAPI.check();
      setApiConnected(true);
      setDemoMode(false);
    } catch (error) {
      setApiConnected(false);
      setDemoMode(true);
      console.warn('Backend API not available, falling back to demo mode');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (demoMode || !apiConnected) {
        // Demo mode - frontend only
        await handleDemoLogin();
      } else {
        // Real API mode
        await handleRealLogin();
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const name = formData.email.split("@")[0] || "Patient";
    localStorage.setItem(
      "demo.user",
      JSON.stringify({ role: "patient", name, email: formData.email })
    );

    toast({
      title: "Welcome back!",
      description: "You have been successfully logged in (demo mode).",
    });

    navigate("/dashboard");
  };

  const handleRealLogin = async () => {
    const response = await authAPI.login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });

    if (response.success) {
      // Store token and user data
      tokenHelper.setToken(response.data.token);
      localStorage.setItem("auth.user", JSON.stringify(response.data.user));

      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });

      // Navigate based on user role
      const dashboardRoutes = {
        patient: "/dashboard",
        doctor: "/doctor-dashboard",
        staff: "/staff-dashboard",
        laboratory: "/laboratory-dashboard",
        admin: "/admin-dashboard",
      };

      navigate(dashboardRoutes[response.data.user.role] || "/dashboard");
    }
  };

  const handleDemoModeToggle = () => {
    setDemoMode(!demoMode);
    toast({
      title: demoMode ? "Switching to API Mode" : "Switching to Demo Mode",
      description: demoMode 
        ? "Will attempt to connect to backend API" 
        : "Will use frontend-only demo data",
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
        {/* Medical Pattern */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="medical-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.1)" />
                <path d="M20 25h10M25 20v10" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#medical-pattern)" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-lg text-center space-y-8">
            <div className="flex items-center justify-center space-x-3">
              <Stethoscope className="h-12 w-12 text-emerald-300" />
              <h1 className="text-4xl font-bold">MediVoice</h1>
            </div>
            
            <h2 className="text-2xl font-light">Patient Portal</h2>
            <p className="text-lg opacity-90">
              Secure access to your health records, appointments, and medical information
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { icon: Heart, label: "Health Records" },
                { icon: Activity, label: "Vital Signs" },
                { icon: Brain, label: "Smart Analytics" },
                { icon: UserCheck, label: "Doctor Consultations" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center space-x-2 text-emerald-200">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-6">
            {/* API Status Indicator */}
            <div className="flex items-center justify-center space-x-2">
              <div className="flex items-center space-x-2">
                {apiConnected === null ? (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-400">Checking connection...</span>
                  </>
                ) : apiConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Backend Connected</span>
                    <Badge variant="secondary" className="ml-2">API</Badge>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600">Demo Mode</span>
                    <Badge variant="outline" className="ml-2">DEMO</Badge>
                  </>
                )}
              </div>
            </div>

            <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
              <CardHeader className="space-y-4">
                <div className="text-center">
                  <CardTitle className="text-2xl text-gray-900">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-600">
                    Sign in to your patient account
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="patient@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        handleInputChange("rememberMe", checked === true)
                      }
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>

                  {/* Mode Toggle (for development) */}
                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDemoModeToggle}
                      className="w-full mt-2"
                    >
                      {demoMode ? "Try API Mode" : "Switch to Demo Mode"}
                    </Button>
                  )}
                </form>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <Link to="/forgot-password" className="text-emerald-600 hover:underline">
                      Forgot password?
                    </Link>
                    <Link to="/register" className="text-emerald-600 hover:underline">
                      Create account
                    </Link>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>Other portals:</p>
                    <div className="flex justify-center space-x-4 mt-2">
                      <Link to="/doctor-login" className="text-emerald-600 hover:underline">
                        Doctor
                      </Link>
                      <Link to="/staff-login" className="text-emerald-600 hover:underline">
                        Staff
                      </Link>
                      <Link to="/laboratory-login" className="text-emerald-600 hover:underline">
                        Laboratory
                      </Link>
                      <Link to="/admin-login" className="text-emerald-600 hover:underline">
                        Admin
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginEnhanced;