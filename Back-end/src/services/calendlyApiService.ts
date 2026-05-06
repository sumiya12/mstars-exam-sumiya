import axios from "axios";

const CALENDLY_TOKEN = process.env.CALENDLY_TOKEN;
const CALENDLY_TOKEN_1= process.env.CALENDLY_TOKEN_1;

const calendlyApi = axios.create({
  baseURL: 'https://api.calendly.com',
  headers: {
    Authorization: `Bearer ${CALENDLY_TOKEN}`,
  },
});
const calendlyApiPortrait = axios.create({
  baseURL: 'https://api.calendly.com',
  headers: {
    Authorization: `Bearer ${CALENDLY_TOKEN_1}`,
  },
});

export const getUserInfo = async () => {
  const response = await calendlyApi.get('/users/me');
  return response.data;
};
export const getUserInfoPortrait = async () => {
  const response = await calendlyApiPortrait.get('/users/me');
  return response.data;
};

