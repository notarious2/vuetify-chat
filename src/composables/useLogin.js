import axios from 'axios';
import Cookies from 'js-cookie';


export default function useLogin() {
  const login = async (payload) => {
    try {
      const formData = new FormData();
      formData.append('username', payload.username);
      formData.append('password', payload.password);
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      };
      console.log(payload);
      const response = await axios.post('http://localhost:8001/login/', formData, {headers: headers, withCredentials: true},);
      Cookies.set('username', response.data.username, { expires: 1 });
      return response.data;
    } catch (error) {

      throw error;
    }
  };

  return {
    login,
  };
}
