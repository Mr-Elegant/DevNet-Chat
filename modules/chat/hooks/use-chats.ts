import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChatWithMessage,
  deleteChat,
  getAllChats,
  getChatById,
} from "@/modules/chat/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type CreateChatValues = {
  content: string;
  model: string;
};

type ChatLike = {
  id: string;
};

type ActionResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const useGetChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: () => getAllChats(),
  });
};

export const useGetChatById = (chatId: string) => {
  return useQuery({
    queryKey: ["chats", chatId],
    queryFn: () => getChatById(chatId),
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<ActionResponse<ChatLike>, Error, CreateChatValues>({
    mutationFn: (values) => createChatWithMessage(values),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });

      if (res.data?.id) {
        router.push(`/chat/${res.data.id}?autoTrigger=true`);
      }
    },
    onError: (error) => {
      console.error("Create chat error:", error);
      toast.error("Failed to create chat");
    },
  });
};

export const useDeleteChat = (chatId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<ActionResponse<unknown>, Error>({
    mutationFn: () => deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.push("/");
    },
    onError: () => {
      toast.error("Failed to delete chat");
    },
  });
};
