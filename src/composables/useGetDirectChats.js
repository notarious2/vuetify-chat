import axios from '@/api/axios';

export default function useGetDirectChats() {
  const getDirectChats = async (userName) => {
    try {
      const response = await axios.get(`/chats/direct/`);
      const allChats = response.data;
      const directChats = [];

      allChats.forEach(chat => {
        const friendInfo = chat.users.find(user => user.username !== userName);

        directChats.push({
          chat_guid: chat["chat_guid"],
          created_at: chat["created_at"],
          updated_at: chat["updated_at"],
          friend: friendInfo,
          has_new_messages: chat["has_new_messages"],
          new_messages_count: chat["new_messages_count"]
        })

      });
      return directChats;

    } catch (error) {
      console.error("Error fetching old messages:", error);
      throw error;
    }
  };


  return { getDirectChats };
}
