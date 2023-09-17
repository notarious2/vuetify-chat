import axios from 'axios';

export default function useRegistration() {
  const register = async (payload) => {
    try {
      console.log(payload);
      const response = await axios.post('http://localhost:8001/register/', payload);
      return response.data;
    } catch (error) {
      // Handle errors (e.g., show an error message)
      throw error;
    }
  };

  return {
    register,
  };
}
