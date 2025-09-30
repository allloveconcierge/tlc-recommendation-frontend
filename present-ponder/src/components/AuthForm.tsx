import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Gift, Lock, Mail, AlertCircle } from "lucide-react";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

const BETA_PASSCODE = "tlc-banana-parrot-2025";
const PASSCODE_STORAGE_KEY = "tlc-beta-access";

export const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [passcodeVerified, setPasscodeVerified] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { toast } = useToast();

  // Check if passcode was previously verified
  useEffect(() => {
    const savedAccess = localStorage.getItem(PASSCODE_STORAGE_KEY);
    if (savedAccess === BETA_PASSCODE) {
      setPasscodeVerified(true);
    }
  }, []);

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  // Clear errors when user starts typing
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields before submitting
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    if (emailValidation || passwordValidation) {
      setEmailError(emailValidation);
      setPasswordError(passwordValidation);
      toast({
        title: "Please check your input",
        description: "All fields are required and must be valid.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let description = error.message;
        
        // Handle specific error cases
        if (error.message.includes("Email not confirmed")) {
          description = "Please check your email and click the confirmation link before signing in.";
        } else if (error.message.includes("Invalid login credentials")) {
          description = "Invalid email or password. Please check your credentials and try again.";
        }
        
        toast({
          title: "Sign in failed",
          description,
          variant: "destructive",
        });
      } else {
        onAuthSuccess();
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields before submitting
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    if (emailValidation || passwordValidation) {
      setEmailError(emailValidation);
      setPasswordError(passwordValidation);
      toast({
        title: "Please check your input",
        description: "All fields are required and must be valid.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirm: true,
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user && !data.user.email_confirmed_at) {
        setShowResendEmail(true);
        setResendEmail(email);
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email (including spam folder) and click the link to activate your account.",
        });
      } else if (data.user?.email_confirmed_at) {
        onAuthSuccess();
      } else {
        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials.",
        });
      }
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === BETA_PASSCODE) {
      setPasscodeVerified(true);
      localStorage.setItem(PASSCODE_STORAGE_KEY, BETA_PASSCODE);
    } else {
      toast({
        title: "Invalid passcode",
        description: "Please enter the correct beta access code.",
        variant: "destructive",
      });
      setPasscode("");
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        toast({
          title: "Failed to resend email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email sent!",
          description: "We've sent another confirmation email. Please check your inbox and spam folder.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to resend email",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">TLC</h1>
          <p className="text-muted-foreground">
            The operating system for relationships that matter to you
          </p>
        </div>

        {!passcodeVerified ? (
          /* Beta Access Passcode */
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Closed Beta Access</CardTitle>
              </div>
              <CardDescription>
                Enter your beta access code to continue
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasscodeSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passcode">Beta Passcode</Label>
                  <Input
                    id="passcode"
                    type="password"
                    placeholder="Enter your beta access code"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Access Beta
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          /* Auth Tabs */
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 mb-2">
              <p className="text-xs text-muted-foreground">
                All fields marked with <span className="text-muted-foreground">*</span> are required
              </p>
            </div>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your account to access your gift profiles
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      Email <span className="text-muted-foreground">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
                      required
                    />
                    {emailError && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{emailError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-1">
                      Password <span className="text-muted-foreground">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className={passwordError ? "border-red-500 focus-visible:ring-red-500" : ""}
                      required
                    />
                    {passwordError && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{passwordError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create account</CardTitle>
                <CardDescription>
                  Create a new account to save your gift profiles
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-1">
                      Email <span className="text-muted-foreground">*</span>
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
                      required
                    />
                    {emailError && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{emailError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-1">
                      Password <span className="text-muted-foreground">*</span>
                      <span className="text-xs text-muted-foreground ml-1">(min 6 characters)</span>
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (at least 6 characters)"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className={passwordError ? "border-red-500 focus-visible:ring-red-500" : ""}
                      required
                      minLength={6}
                    />
                    {passwordError && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{passwordError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          </Tabs>
        )}

        {/* Email Resend Section */}
        {showResendEmail && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Didn't receive the email?</CardTitle>
              </div>
              <CardDescription>
                Check your spam folder or click below to resend the confirmation email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Email will be sent to: <strong>{resendEmail}</strong>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleResendEmail} 
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend Confirmation Email
              </Button>
            </CardFooter>
          </Card>
        )}

        {passcodeVerified && (
          /* Guest Mode */
          <div className="text-center">
            <Button variant="outline" onClick={handleGuestMode} className="w-full">
              Continue as Guest
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Guest mode allows you to try the app without creating an account
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
