import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8001',
  // Other default configurations if needed
});

const getAccessTokenFromCookies = () => {
  return Cookies.get('access_token');
};

var getCookies = function(){
    var pairs = document.cookie.split(";");
    var cookies = {};
    for (var i=0; i<pairs.length; i++){
      var pair = pairs[i].split("=");
      cookies[(pair[0]+'').trim()] = unescape(pair.slice(1).join('='));
    }
    return cookies;
  }


axiosInstance.interceptors.request.use((config) => {
config.withCredentials = true; 
  return config;
});

export default axiosInstance;
