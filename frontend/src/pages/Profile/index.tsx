import { ProfileForm } from "./components/profile-form";
import { PasswordForm } from "./components/password-form";
import { HeaderActions } from "./components/header-actions";

export const ProfilePage = () => {
  return (
    <div className=" h-screen flex flex-col overflow-hidden">
      <div className="sticky top-0 z-50">
        <HeaderActions />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-6 space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Main content - Profile Form */}
            <div className="flex flex-col gap-8">
              <ProfileForm />
            </div>

            {/* Sidebar - Password Form */}
            <div className="flex flex-col gap-8">
              <PasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
