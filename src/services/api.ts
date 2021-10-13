import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();

type ResponseToken = {
  token: string;
  refreshToken: string;
};

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['@nextauth:token']}`
  }
});

api.interceptors.response.use(response => {
  return response;
}, (error: AxiosError) => {
  if (error.response.status === 401) {
    if (error.response.data?.code === 'token.expired') {
      cookies = parseCookies();

      const { '@nextauth:refreshToken': refreshToken } = cookies;

      api.post('/refresh', {
        refreshToken,
      }).then(response => {
        const { token, refreshToken: newRefreshToken } = response.data as ResponseToken;

        setCookie(null, '@nextauth:token', token, {
          maxAge: 60 * 60 * 24 * 30, // 30 days    
          path: '/',  
        });

        setCookie(null, '@nextauth:refreshToken', newRefreshToken, {
          maxAge: 60 * 60 * 24 * 30, // 30 days    
          path: '/',  
        });

        api.defaults.headers['Authorization'] = `Bearer ${token}`;
      });
      
    } else {

    }
  }
});