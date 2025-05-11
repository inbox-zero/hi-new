import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
} 