import { useForm } from "react-hook-form";
import { employeeSchema, type EmployeeFormValues } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormValues) => void;
  isLoading?: boolean;
}

export const EmployeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: EmployeeModalProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
      role: "salers",
    },
  });

  const selectedRole = watch("role");

  const handleOnSubmit = (data: EmployeeFormValues) => {
    onSubmit(data);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Thêm nhân viên mới
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleOnSubmit)}
          className="space-y-4 py-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel>
                Tên nhân viên <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                placeholder="Nhập tên nhân viên"
                {...register("displayName")}
                disabled={isLoading}
              />
              {errors?.displayName && (
                <FieldError>{errors.displayName.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel>
                Số điện thoại
                <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                placeholder="Nhập số điện thoại"
                {...register("phoneNumber")}
                disabled={isLoading}
              />
              {errors?.phoneNumber && (
                <FieldError>{errors.phoneNumber.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel>
                Email <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                placeholder="Nhập email"
                {...register("email")}
                disabled={isLoading}
              />
              {errors?.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>
                Chức vụ <span className="text-red-500">*</span>
              </FieldLabel>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setValue("role", value as "salers" | "accountant", {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem
                    value="salers"
                    className="focus:bg-orange-50 focus:text-orange-600"
                  >
                    Nhân viên Sales
                  </SelectItem>
                  <SelectItem
                    value="accountant"
                    className="focus:bg-emerald-50 focus:text-emerald-700"
                  >
                    Kế toán
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors?.role && <FieldError>{errors.role.message}</FieldError>}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant={"outline"}
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/80">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Đang xử lý" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
