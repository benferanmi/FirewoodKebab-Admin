import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChefHat, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { AdminRole } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api/auth";
import { loginSchema, LoginFormData } from "@/validations/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "superadmin@example.com",
      password: "SuperAdmin@123",
    },
  });

  const onSubmit = async (formData: LoginFormData) => {
    const loginData = { email: formData.email!, password: formData.password! };
    try {
      const response = await authAPI.login(loginData);
      const { admin, accessToken, refreshToken } = response.data;

      setAuth(
        {
          _id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          phone: admin.phone,
          role: admin.role as AdminRole,
          isActive: admin.isActive,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
          permissions: admin.permissions,
        },
        { accessToken, refreshToken },
      );

      toast({
        title: "Welcome back!",
        description: `Signed in as ${admin.firstName}`,
      });
      navigate("/admin/dashboard");
    } catch (error: any) {
      // Fallback to mock login if API is not available
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "An error occurred",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f7f5] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sidebar-primary shadow-lg shadow-sidebar-primary/25">
            <ChefHat className="h-7 w-7 text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-black">
            Firewoodkebabadmin
          </h1>
          <p className="mt-1 text-sm text-sidebar-foreground/90">
            Sign in to your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}  className=" rounded-xl bg-white p-6 space-y-4 shadow-[var(--shadow-card)] border border-border">
          <div className="space-y-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-sidebar-foreground">
                Email
              </Label>
              <Input
                type="email"
                {...register("email")}
                className="bg-sidebar/0 border-sidebar-border/10 text-black placeholder:text-sideqbar-foreground/40 focus:border-sidebar-primary"
                placeholder="admin@restaurant.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2 pb-4">
              <Label className="text-xs font-medium text-sidebar-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="bg-sidebar/0 border-sidebar-border/10 text-black pr-10 placeholder:text-sidebar-foreground/40 focus:border-sidebar-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="space-y-4 absolute right-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/50 hover:text-sidebar-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-semibold"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>

          {/* <p className="text-center text-[11px] text-sidebar-foreground/40">
            Demo: superadmin@example.com / password123
          </p> */}
        </form>
      </div>
    </div>
  );
}
