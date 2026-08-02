import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { SignIn } from "@clerk/clerk-react";
import { Logo } from "@/components/common/Logo";
import { useThemeStore } from "@/store/themeStore";

const Scroll3DBackground = lazy(() => import("@/components/home/Scroll3DBackground").then(module => ({ default: module.Scroll3DBackground })));

export function LoginPage() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden bg-transparent">
      {/* 3D Background with Suspense */}
      <Suspense fallback={<div className="fixed inset-0 bg-background -z-10" />}>
        <Scroll3DBackground />
      </Suspense>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 flex flex-col items-center"
      >
        <div className="mb-8">
          <Logo />
        </div>
        
        <div className="w-full flex justify-center">
          <SignIn 
            routing="path" 
            path="/login" 
            signUpUrl="/register"
            appearance={{
              elements: {
                rootBox: "w-full flex justify-center",
                card: "glass rounded-3xl shadow-2xl backdrop-blur-xl border border-white/10 w-full max-w-[400px] overflow-hidden",
                headerTitle: `text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`,
                headerSubtitle: `${isDark ? 'text-gray-400' : 'text-gray-500'}`,
                socialButtonsBlockButton: `border ${isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100'}`,
                socialButtonsBlockButtonText: `font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`,
                dividerLine: `${isDark ? 'bg-white/10' : 'bg-gray-200'}`,
                dividerText: `${isDark ? 'text-gray-400' : 'text-gray-500'}`,
                formFieldLabel: `font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`,
                formFieldInput: `bg-background/50 border ${isDark ? 'border-white/10 text-white focus:border-primary focus:ring-primary/20' : 'border-gray-200 text-gray-900 focus:border-primary focus:ring-primary/20'} rounded-xl`,
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg",
                footerActionText: `${isDark ? 'text-gray-400' : 'text-gray-500'}`,
                footerActionLink: "text-primary hover:text-primary/80 font-semibold",
                identityPreviewText: `${isDark ? 'text-white' : 'text-gray-900'}`,
                identityPreviewEditButton: "text-primary hover:text-primary/80"
              },
              variables: {
                colorPrimary: isDark ? "#4f46e5" : "#1a1410",
                colorText: isDark ? "white" : "black",
                colorBackground: "transparent",
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
