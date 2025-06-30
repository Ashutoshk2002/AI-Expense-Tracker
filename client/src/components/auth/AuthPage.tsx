import { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { SignUpForm } from "./SignUpForm";
import { SignInForm } from "./SignInForm";

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <AuthLayout
      title={isSignUp ? "Create your account" : "Sign in to your account"}
      subtitle={
        isSignUp
          ? "Start your journey to better financial management"
          : "Welcome back! Please sign in to continue"
      }
    >
      {isSignUp ? (
        <SignUpForm onSwitchToSignIn={() => setIsSignUp(false)} />
      ) : (
        <SignInForm onSwitchToSignUp={() => setIsSignUp(true)} />
      )}
    </AuthLayout>
  );
}
