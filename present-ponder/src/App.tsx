import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { AuthCallback } from "./pages/AuthCallback";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GuestMode from "./components/GuestMode";
import { GuestDataManager } from "@/lib/guestDataManager";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [isProcessingGuestData, setIsProcessingGuestData] = useState(false);
  const { toast } = useToast();

  // Reset guest mode when user signs out
  React.useEffect(() => {
    if (!user) {
      setGuestMode(false);
    }
  }, [user]);

  // Automatically save guest data when user successfully authenticates
  useEffect(() => {
    const handleGuestDataSave = async () => {
      // Only process if user just authenticated and we haven't already processed guest data
      if (user && !isProcessingGuestData && GuestDataManager.hasGuestData()) {
        setIsProcessingGuestData(true);
        
        try {
          // Get guest data before saving (since it gets cleared after successful save)
          const guestData = GuestDataManager.getGuestData();
          const recipientName = guestData?.recipientName || 'your recipient';
          
          const success = await GuestDataManager.saveGuestDataToAccount();
          
          if (success) {
            toast({
              title: "Profile Saved Successfully!",
              description: `Your guest session data for ${recipientName} has been automatically saved to your account.`,
              duration: 5000,
            });
          }
        } catch (error) {
          console.error('Error saving guest data:', error);
          toast({
            title: "Profile Save Failed",
            description: "We couldn't automatically save your guest session data. You can manually recreate the profile if needed.",
            variant: "destructive",
            duration: 6000,
          });
        } finally {
          setIsProcessingGuestData(false);
        }
      }
    };

    handleGuestDataSave();
  }, [user, isProcessingGuestData, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/guest" element={<GuestMode onExitGuest={() => setGuestMode(false)} />} />
      <Route path="/" element={
        user ? <Index /> : 
        guestMode ? <GuestMode onExitGuest={() => setGuestMode(false)} /> :
        <AuthForm onAuthSuccess={() => setGuestMode(true)} />
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
