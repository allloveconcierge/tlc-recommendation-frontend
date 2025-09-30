import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if ((type === 'signup' || type === 'recovery') && accessToken && refreshToken) {
          // Set the session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setSuccess(false);
            setMessage(`Verification failed: ${error.message}`);
            toast({
              title: type === 'recovery' ? "Password reset failed" : "Email verification failed",
              description: error.message,
              variant: "destructive",
            });
          } else if (data.user) {
            setSuccess(true);
            if (type === 'recovery') {
              setMessage("Password reset successful! You can now update your password in your account settings.");
              toast({
                title: "Password reset successful!",
                description: "You are now signed in and can update your password.",
              });
            } else {
              setMessage("Email verified successfully! Your account is now active.");
              toast({
                title: "Email verified!",
                description: "Your account has been successfully verified.",
              });
            }
            
            // Redirect to main app after a short delay
            setTimeout(() => {
              navigate('/');
            }, 2000);
          }
        } else {
          // Handle other types of auth callbacks or missing parameters
          setSuccess(false);
          setMessage("Invalid verification link or missing parameters.");
        }
      } catch (error) {
        setSuccess(false);
        setMessage("An unexpected error occurred during verification.");
        console.error('Auth callback error:', error);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  const handleReturnToLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-6 w-6 animate-spin" />}
            {success === true && <CheckCircle className="h-6 w-6 text-green-500" />}
            {success === false && <XCircle className="h-6 w-6 text-red-500" />}
            {loading ? "Verifying..." : success ? "Verified!" : "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {loading ? "Please wait while we verify your email..." : message}
          </p>
          
          {!loading && (
            <Button onClick={handleReturnToLogin} className="w-full">
              {success ? "Continue to App" : "Return to Login"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
