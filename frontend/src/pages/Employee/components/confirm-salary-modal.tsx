import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { exportSalarySchema, type ExportSalaryFormValues } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: { month: number; year: number }) => void;
  isLoading?: boolean;
}
export const ExportSalaryModal = ({
  isOpen,
  onClose,
  onExport,
  isLoading = false,
}: ExportSalaryModalProps) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { handleSubmit, setValue, watch, reset } =
    useForm<ExportSalaryFormValues>({
      resolver: zodResolver(exportSalarySchema),
      defaultValues: {
        month: currentMonth,
        year: currentYear,
      },
    });

  const selectedMonth = watch("month");
  const selectedYear = watch("year");

  const handleOnSubmit = (data: ExportSalaryFormValues) => {
    onExport(data);
  };

  const handleOnChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };
  //   useEffect(() => {
  //     if (isOpen) {
  //       reset({
  //         month: currentMonth,
  //         year: currentYear,
  //       });
  //     }
  //   }, [isOpen, reset, currentMonth, currentYear]);

  const years = Array.from(
    { length: currentYear - 2024 + 1 },
    (_, i) => 2024 + i,
  ).reverse();

  return (
    <Dialog open={isOpen} onOpenChange={handleOnChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            Xuất dữ liệu lương
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleOnSubmit)}
          className="space-y-4 py-4"
        >
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Chọn Tháng</FieldLabel>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(val) => setValue("month", parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tháng" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Chọn Năm</FieldLabel>
              <Select
                value={selectedYear.toString()}
                onValueChange={(val) => setValue("year", parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOnChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xuất File
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
