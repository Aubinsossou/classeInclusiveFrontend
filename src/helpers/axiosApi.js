
import api from '@/services/axios';
const handleApiError = (err) => {
  console.error('Erreur API :', err)
  throw err
}
export const apiGet = async (url) => {
  const token = localStorage.getItem('access_token');
  try {
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (err) {
    return handleApiError(err);
  }
};
export const apiPost = async (url, data) => {
  const token = localStorage.getItem('access_token');
  const isFormData = data instanceof FormData;

  try {
    const response = await api.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData
          ? {}
          : { 'Content-Type': 'application/json' }
        ),
      },
      transformRequest: isFormData ? [(data) => data] : undefined,
    });
    return response;
  } catch (err) {
    throw err;
  }
};
export const apiPut = async (url, data) => {
  const token = localStorage.getItem('access_token');
  try {
    const response = await api.put(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiDelete = async (url) => {
  const token = localStorage.getItem('access_token');
  try {
    const response = await api.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (err) {
    return handleApiError(err);
  }
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

