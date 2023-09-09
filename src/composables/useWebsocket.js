import { ref, onMounted } from "vue";

export function useWebSocket(url) {
  const socket = ref(null);
  const newMessages = ref([]); // Store received messages

  const connectWebSocket = () => {
    socket.value = new WebSocket(url);

    socket.value.addEventListener("open", () => {
      console.log("WebSocket connection established.");
      // You can add your logic here when the connection is established.
    });

    socket.value.addEventListener("message", (event) => {
      console.log("Received message:", event.data);
    });

    socket.value.addEventListener("close", () => {
      console.log("WebSocket connection closed.");
      // Handle connection closed here.
    });
  };

  onMounted(() => {
    connectWebSocket();
  });

  return { socket};
}