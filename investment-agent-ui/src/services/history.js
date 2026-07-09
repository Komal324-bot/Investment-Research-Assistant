import api from './api';

export const getHistory = async () => {
  try {
    const response = await api.get('/api/history/recent');
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await api.delete('/api/history/clear');
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};

export const deleteHistoryItem = async (id) => {
  try {
    await api.delete(`/api/history/${id}`);
  } catch (error) {
    console.error('Error deleting history item:', error);
  }
};

export const togglePin = async (id, pinned) => {
  try {
    const response = await api.patch(`/api/history/${id}/pin`, { pinned });
    return response.data;
  } catch (error) {
    console.error('Error updating pin status:', error);
    throw error;
  }
};