import { LoginForm } from "@/components/login-form";
import { GalleryVerticalEnd } from "lucide-react";
import welcomImage from "@/assets/Welcome.png";

export const SignInPage = () => {
  return (
    <div className="relative fluid-gradient-container flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-xl border bg-background shadow-xl lg:grid-cols-2">
        <div className="flex flex-col gap-6 p-8 md:p-12">
          <div className="flex justify-center gap-2 lg:justify-start">
            <a href="#" className="flex items-center gap-2 font-bold text-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-5" />
              </div>
              Acme Inc.
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <img
            src={welcomImage}
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </div>
  );
};
