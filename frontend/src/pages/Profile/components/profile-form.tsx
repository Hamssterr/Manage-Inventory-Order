import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Loader2, User as UserIcon } from "lucide-react";

import { useAuthStore } from "@/stores/useAuthStore";
import { useUpdateProfileMutation, useUploadMutation } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  displayName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z
    .string()
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
  avatarUrl: z.string().url("Link is incorrect").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileForm = () => {
  const { user } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfileMutation();
  const { mutateAsync: uploadAvatar } = useUploadMutation();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatarUrl || null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user?._id]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await uploadAvatar(formData);
      setAvatarUrl(response.data.url);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    if (!user?._id) return;

    updateProfile({
      id: user._id,
      data: {
        ...data,
        avatarUrl: avatarUrl || undefined,
      },
    });
  };

  return (
    <Card className="shadow-sm border-slate-100">
      <CardHeader>
        <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
        <CardDescription>
          Cập nhật ảnh đại diện và thông tin liên hệ của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-2 border-white shadow-md">
                <AvatarImage
                  src={avatarUrl || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-slate-100">
                  <UserIcon className="w-10 h-10 text-slate-400" />
                </AvatarFallback>
              </Avatar>
              {(isUploading || isPending) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <Camera className="w-6 h-6" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-slate-900">Ảnh đại diện</h4>
              <p className="text-sm text-slate-500">
                Nhấp vào ảnh để thay đổi. Nên dùng ảnh vuông (PNG, JPG).
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Họ và Tên</Label>
              <Input
                id="displayName"
                {...register("displayName")}
                placeholder="Nhập họ và tên"
                className={errors.displayName ? "border-red-500" : ""}
              />
              {errors.displayName && (
                <p className="text-sm text-red-500">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Nhập địa chỉ email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="Nhập số điện thoại"
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Input
                id="role"
                value={user?.role || ""}
                disabled
                className="bg-slate-50 text-slate-500 capitalize"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={
                (!isDirty && avatarUrl === user?.avatarUrl) || isPending
              }
              className="w-full sm:w-auto"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
