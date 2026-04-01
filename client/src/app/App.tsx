import { useState } from "react";
import { SignInModal } from "./components/sign-in-modal";
import { SignUpModal } from "./components/sign-up-modal";
import { Button } from "./components/ui/button";

export default function App() {
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E4F5E5" }}>
      <div className="text-center space-y-8 p-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-6xl" style={{ color: "#1E691E" }}>
            BiteCheck
          </h1>
          <p className="text-xl" style={{ color: "#1B1B1B" }}>
            Your trusted food safety companion
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setSignInOpen(true)}
            className="px-8 py-6 text-lg bg-[#50A350] hover:bg-[#1E691E] text-white"
          >
            Sign In
          </Button>
          <Button
            onClick={() => setSignUpOpen(true)}
            className="px-8 py-6 text-lg bg-[#85C085] hover:bg-[#50A350] text-white"
          >
            Sign Up
          </Button>
        </div>
      </div>

      {/* Modals */}
      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
      <SignUpModal open={signUpOpen} onOpenChange={setSignUpOpen} />
    </div>
  );
}
