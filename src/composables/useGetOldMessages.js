import axios from '@/api/axios';

export default function useGetOldMessages() {
  const getOldMessages = async (chatGUID, messageGUID) => {
    try {
      const response = await axios.get(`/chat/${chatGUID}/messages/old/${messageGUID}/`);
      console.log("get old messages response", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching old messages:", error);
      throw error;
    }
  };


  return { getOldMessages };
}
