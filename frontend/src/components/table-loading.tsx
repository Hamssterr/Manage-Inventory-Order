import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export const TableLoading = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
};

interface TableErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const TableError = ({ message, onRetry }: TableErrorProps) => {
  return (
    <div className="flex flex-col h-full items-center justify-between text-destructive gap-3">
      <AlertCircle className="h-10 w-10 opacity-80" />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2 text-foreground"
        >
          Thử lại
        </Button>
      )}
    </div>
  );
};
