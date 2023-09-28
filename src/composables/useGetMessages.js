import axios from '@/api/axios';

const useGetMessages = () => ({
  getMessages: async (chatGUID) => {
    try {
      const response = await axios.get(`/chat/${chatGUID}/messages/`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  },
});

export default useGetMessages;
