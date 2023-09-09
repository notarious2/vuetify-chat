import axios from "axios";
import { ref, onMounted } from "vue";

export function useMessageHistory() {
  const messages = ref([]);

  const fetchMessageHistory = async () => {
    try {
      const response = await axios.get("http://localhost:8000/messages/");
      messages.value = response.data;
    } catch (error) {
      console.error("Error fetching message history:", error);
      messages.value = []
    }
  };

  onMounted(() => {
    fetchMessageHistory();
  });

  return { messages };
}
