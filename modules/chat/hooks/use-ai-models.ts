import { useQuery } from "@tanstack/react-query";

export const useAIModels = () => {
  return useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const response = await fetch("/api/ai/get-models");

      if (!response.ok) {
        throw new Error("Failed to fetch AI models");
      }

      return response.json();
    },
  });
};
