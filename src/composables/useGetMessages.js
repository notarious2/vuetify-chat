import axios from '@/api/axios';

export default function useGetMessages() {
  const getMessages = async (chatGUID) => {
    try {
      const response = await axios.get(`/chat/${chatGUID}/messages/`, {withCredentials: true});
      console.log("getMessages response", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  };


  return { getMessages };
}
