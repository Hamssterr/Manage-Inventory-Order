import { SignupForm } from "@/components/signup-form";
import SignUpImage from "@/assets/SignUp.png";

export const SignUpPage = () => {
  return (
    <div className="flex fluid-gradient-container min-h-screen items-center justify-center bg-gray-100 p-4 md:p-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-background shadow-2xl lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start"></div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <SignupForm />
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <img
            src={SignUpImage}
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </div>
  );
};
