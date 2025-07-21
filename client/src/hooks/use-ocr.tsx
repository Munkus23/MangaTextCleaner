import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OCRResult {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  confidence: number;
}

export function useOCR() {
  const { toast } = useToast();

  const ocrMutation = useMutation({
    mutationFn: async (projectId: number): Promise<OCRResult[]> => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/ocr`, null);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "OCR Complete",
        description: "Text detection completed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "OCR Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    runOCR: ocrMutation.mutate,
    isLoading: ocrMutation.isPending,
    error: ocrMutation.error,
  };
}
