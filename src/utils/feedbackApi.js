import axios from 'axios';

const API_BASE = 'https://production-project-1.onrender.com/api';

export const fetchFeedback = async () => {
  const res = await axios.get(`${API_BASE}/feedback`, { withCredentials: true });
  return res.data;
};

export const submitFeedback = async (feedback) => {
  const res = await axios.post(`${API_BASE}/feedback`, feedback);
  return res.data;
};

export const deleteFeedback = async (id) => {
  const res = await axios.delete(`${API_BASE}/feedback/${id}`, { withCredentials: true });
  return res.data;
};
