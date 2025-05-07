const axios = require('axios');

const CALENDLY_TOKEN = process.env.CALENDLY_TOKEN;

const calendlyApi = axios.create({
  baseURL: 'https://api.calendly.com',
  headers: {
    Authorization: `Bearer ${CALENDLY_TOKEN}`,
  },
});

const getUserInfo = async () => {
  const response = await calendlyApi.get('/users/me');
  return response.data;
};

module.exports = {
  getUserInfo,
};
