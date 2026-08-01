import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Smartphone, Mail, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export function SecuritySettings() {
  const [emailVerified, setEmailVerified] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [otp, setOtp] = useState("");

  const handleVerifyEmail = () => {
    toast.success("Verification email sent! Check your inbox.");
    // Simulate clicking link
    setTimeout(() => setEmailVerified(true), 2000);
  };

  const handleVerify2FA = () => {
    if (otp.length === 6) {
      toast.success("2FA Successfully Enabled!");
      setTwoFactorEnabled(true);
      setIsSettingUp2FA(false);
    } else {
      toast.error("Invalid OTP code. Try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Security & Authentication
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your account security, email verification, and two-factor
          authentication.
        </p>
      </div>

      <div className="grid gap-6 mt-8">
        {/* Email Verification */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" /> Email Verification
              </CardTitle>
              <CardDescription>
                Verify your email address to secure your account and receive
                travel updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50">
                <div>
                  <p className="font-medium">john.doe@example.com</p>
                  {emailVerified ? (
                    <p className="text-sm text-green-500 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-4 w-4" /> Verified
                    </p>
                  ) : (
                    <p className="text-sm text-orange-500 mt-1">Unverified</p>
                  )}
                </div>
                {!emailVerified && (
                  <Button variant="outline" onClick={handleVerifyEmail}>
                    Send Link
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" /> Two-Factor Authentication
                (2FA)
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account using an
                authenticator app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {twoFactorEnabled ? (
                <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-bold text-green-700 dark:text-green-400">
                        2FA is Enabled
                      </p>
                      <p className="text-sm text-green-600/80 dark:text-green-500/80">
                        Your account is highly secure.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setTwoFactorEnabled(false)}
                  >
                    Disable 2FA
                  </Button>
                </div>
              ) : isSettingUp2FA ? (
                <div className="p-6 bg-background/50 rounded-xl border border-border/50 space-y-6">
                  <div className="text-center">
                    <h3 className="font-bold mb-2">Scan QR Code</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use Google Authenticator or Authy to scan this code.
                    </p>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/TripPlanner:john.doe@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TripPlanner`}
                      alt="2FA QR Code"
                      className="mx-auto rounded-lg shadow-sm"
                    />
                    <p className="text-xs font-mono bg-muted p-2 rounded mt-4 max-w-[200px] mx-auto">
                      JBSWY3DPEHPK3PXP
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto">
                    <label className="text-sm font-medium mb-2 block">
                      Enter 6-digit code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="text-center text-lg tracking-widest"
                      />
                      <Button onClick={handleVerify2FA}>Verify</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50">
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Not configured
                    </p>
                  </div>
                  <Button onClick={() => setIsSettingUp2FA(true)}>
                    Set Up 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
