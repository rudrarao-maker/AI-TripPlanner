import { motion } from "framer-motion";
import { SignIn } from "@clerk/clerk-react";
import { Logo } from "@/components/common/Logo";

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mb-8 flex justify-center"
      >
        <Logo />
      </motion.div>
      <SignIn routing="path" path="/login" signUpUrl="/register" />
    </div>
  );
}
