import axios from '@/api/axios';

export default function useGetChats() {
  const getChats = async (userName) => {
    try {
      const response = await axios.get(`/chats/`);

      const allChats = response.data;
      const directChats = [];
      const groupChats = [];

      allChats.forEach(chat => {
        if (chat["chat_type"] === "direct") {
          const friendInfo = chat.users.find(user => user.username !== userName);

          directChats.push({
            chat_guid: chat["guid"],
            created_at: chat["created_at"],
            updated_at: chat["updated_at"],
            friend: friendInfo
          })
        }
      });
      return [directChats, groupChats];

    } catch (error) {
      console.error("Error fetching old messages:", error);
      throw error;
    }
  };


  return { getChats };
}
