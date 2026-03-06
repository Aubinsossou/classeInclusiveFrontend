// src/helpers/api.js
import api from '@/services/axios';

const handleApiError = (err) => {
  console.error('Erreur API :', err);
  return {
    data: null,
    error: err.response?.data?.message || err.message || 'Erreur inconnue'
  };
};

export const apiGet = async (url) => {
  const token = localStorage.getItem('token');
  try {
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIwMTljYmI0ZC1lOTIxLTcxZDAtODczNC03YTQzNmRkNWFiMmEiLCJqdGkiOiI3YTdhY2Q5M2E0YzNjZTc3NmVmMzNhNjg0NWY1NTJmNjRmZDFhNjA5YjRkODNjNmIzZTNhNTdlNWIxMjc4YWNjMmM4ZTY5MmJhMGNlZTFiMyIsImlhdCI6MTc3MjY2ODk3Ni43MzgyMjgsIm5iZiI6MTc3MjY2ODk3Ni43MzgyMzEsImV4cCI6MTgwNDIwNDk3Ni43MjQ0MzksInN1YiI6IjEiLCJzY29wZXMiOltdfQ.e4LGr2pdjwbGJi7GDJrwE-f1QHKyatZwmR8OBnnhRPe9TFVRQ_NoQ_LmxE9jHrJEq-mGmPdi_-8mbGdwYyRbN2EPbZX9P7bFBM3rQu5L6zMqlWdYKLp-9EoKnvlBVbvoeD7qZFbr68IN9OHVDhMWLlywVTbW2CpD23ATzj8bLQp7Sz6mbHywSk_XK_CDIoRhIapER4IQLiTgS1e35ne2W2HfAzrsWK3heg4qXBWTbStq5Pun3lKIMfS_GqzaMs9EW3M5ma2Q_aNFwQVD2z-Wz3_M1I28xJqFsaGoofB0Uz0yahKsLDA5DqG-JICJIhJij3x2dfG7esi8AOGlhk1vF3tNsUQk03tVz0MOsOKoxcvEmQ7WcsT7fQwEsJY4Xstdr-Ry2o-N2rfyos5deVzpSdjzqlFM3jArSV1U4DlyB9vsl0F_ZWakpEH4rp_rLuxMCHQOgtpz_h0WnN5_2jllbOrUfG0QCK5JmGSZMhQQ8d4fKjBpRI6dZ52Mwpj_a0ws7GITtoS1R53q2bRy6Kk17RsF3Fd0Gg6ojnt6Tp7-RWb8v8Zt9wm1psek6duqxnRtpLjpYji-0ZE806IAql_ix3IqTj8bTlvOXpzXAb2TUxDJ0VRVVpV1myjG8catmsKibZMNW8Ea7y-HVZJMkDYIE2XnJVZoDBUHVBosSGi-GuE"}`,
      },
    });
    return response.data;
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiPost = async (url, data) => {
  const token = localStorage.getItem('token');
  try {
    const response = await api.post(url, data, {
      headers: {
        Authorization: `Bearer ${"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIwMTljYmI0ZC1lOTIxLTcxZDAtODczNC03YTQzNmRkNWFiMmEiLCJqdGkiOiI3YTdhY2Q5M2E0YzNjZTc3NmVmMzNhNjg0NWY1NTJmNjRmZDFhNjA5YjRkODNjNmIzZTNhNTdlNWIxMjc4YWNjMmM4ZTY5MmJhMGNlZTFiMyIsImlhdCI6MTc3MjY2ODk3Ni43MzgyMjgsIm5iZiI6MTc3MjY2ODk3Ni43MzgyMzEsImV4cCI6MTgwNDIwNDk3Ni43MjQ0MzksInN1YiI6IjEiLCJzY29wZXMiOltdfQ.e4LGr2pdjwbGJi7GDJrwE-f1QHKyatZwmR8OBnnhRPe9TFVRQ_NoQ_LmxE9jHrJEq-mGmPdi_-8mbGdwYyRbN2EPbZX9P7bFBM3rQu5L6zMqlWdYKLp-9EoKnvlBVbvoeD7qZFbr68IN9OHVDhMWLlywVTbW2CpD23ATzj8bLQp7Sz6mbHywSk_XK_CDIoRhIapER4IQLiTgS1e35ne2W2HfAzrsWK3heg4qXBWTbStq5Pun3lKIMfS_GqzaMs9EW3M5ma2Q_aNFwQVD2z-Wz3_M1I28xJqFsaGoofB0Uz0yahKsLDA5DqG-JICJIhJij3x2dfG7esi8AOGlhk1vF3tNsUQk03tVz0MOsOKoxcvEmQ7WcsT7fQwEsJY4Xstdr-Ry2o-N2rfyos5deVzpSdjzqlFM3jArSV1U4DlyB9vsl0F_ZWakpEH4rp_rLuxMCHQOgtpz_h0WnN5_2jllbOrUfG0QCK5JmGSZMhQQ8d4fKjBpRI6dZ52Mwpj_a0ws7GITtoS1R53q2bRy6Kk17RsF3Fd0Gg6ojnt6Tp7-RWb8v8Zt9wm1psek6duqxnRtpLjpYji-0ZE806IAql_ix3IqTj8bTlvOXpzXAb2TUxDJ0VRVVpV1myjG8catmsKibZMNW8Ea7y-HVZJMkDYIE2XnJVZoDBUHVBosSGi-GuE"}`,
      },
    });
    return response.data;
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiPut = async (url, data) => {
  const token = localStorage.getItem('token');
  try {
    const response = await api.put(url, data, {
      headers: {
        Authorization: `Bearer ${"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIwMTljYmI0ZC1lOTIxLTcxZDAtODczNC03YTQzNmRkNWFiMmEiLCJqdGkiOiI3YTdhY2Q5M2E0YzNjZTc3NmVmMzNhNjg0NWY1NTJmNjRmZDFhNjA5YjRkODNjNmIzZTNhNTdlNWIxMjc4YWNjMmM4ZTY5MmJhMGNlZTFiMyIsImlhdCI6MTc3MjY2ODk3Ni43MzgyMjgsIm5iZiI6MTc3MjY2ODk3Ni43MzgyMzEsImV4cCI6MTgwNDIwNDk3Ni43MjQ0MzksInN1YiI6IjEiLCJzY29wZXMiOltdfQ.e4LGr2pdjwbGJi7GDJrwE-f1QHKyatZwmR8OBnnhRPe9TFVRQ_NoQ_LmxE9jHrJEq-mGmPdi_-8mbGdwYyRbN2EPbZX9P7bFBM3rQu5L6zMqlWdYKLp-9EoKnvlBVbvoeD7qZFbr68IN9OHVDhMWLlywVTbW2CpD23ATzj8bLQp7Sz6mbHywSk_XK_CDIoRhIapER4IQLiTgS1e35ne2W2HfAzrsWK3heg4qXBWTbStq5Pun3lKIMfS_GqzaMs9EW3M5ma2Q_aNFwQVD2z-Wz3_M1I28xJqFsaGoofB0Uz0yahKsLDA5DqG-JICJIhJij3x2dfG7esi8AOGlhk1vF3tNsUQk03tVz0MOsOKoxcvEmQ7WcsT7fQwEsJY4Xstdr-Ry2o-N2rfyos5deVzpSdjzqlFM3jArSV1U4DlyB9vsl0F_ZWakpEH4rp_rLuxMCHQOgtpz_h0WnN5_2jllbOrUfG0QCK5JmGSZMhQQ8d4fKjBpRI6dZ52Mwpj_a0ws7GITtoS1R53q2bRy6Kk17RsF3Fd0Gg6ojnt6Tp7-RWb8v8Zt9wm1psek6duqxnRtpLjpYji-0ZE806IAql_ix3IqTj8bTlvOXpzXAb2TUxDJ0VRVVpV1myjG8catmsKibZMNW8Ea7y-HVZJMkDYIE2XnJVZoDBUHVBosSGi-GuE"}`,
      },
    });
    return response.data;
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiDelete = async (url) => {
  const token = localStorage.getItem('token');
  try {
    const response = await api.delete(url, {
      headers: {
        Authorization: `Bearer ${"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIwMTljYmI0ZC1lOTIxLTcxZDAtODczNC03YTQzNmRkNWFiMmEiLCJqdGkiOiI3YTdhY2Q5M2E0YzNjZTc3NmVmMzNhNjg0NWY1NTJmNjRmZDFhNjA5YjRkODNjNmIzZTNhNTdlNWIxMjc4YWNjMmM4ZTY5MmJhMGNlZTFiMyIsImlhdCI6MTc3MjY2ODk3Ni43MzgyMjgsIm5iZiI6MTc3MjY2ODk3Ni43MzgyMzEsImV4cCI6MTgwNDIwNDk3Ni43MjQ0MzksInN1YiI6IjEiLCJzY29wZXMiOltdfQ.e4LGr2pdjwbGJi7GDJrwE-f1QHKyatZwmR8OBnnhRPe9TFVRQ_NoQ_LmxE9jHrJEq-mGmPdi_-8mbGdwYyRbN2EPbZX9P7bFBM3rQu5L6zMqlWdYKLp-9EoKnvlBVbvoeD7qZFbr68IN9OHVDhMWLlywVTbW2CpD23ATzj8bLQp7Sz6mbHywSk_XK_CDIoRhIapER4IQLiTgS1e35ne2W2HfAzrsWK3heg4qXBWTbStq5Pun3lKIMfS_GqzaMs9EW3M5ma2Q_aNFwQVD2z-Wz3_M1I28xJqFsaGoofB0Uz0yahKsLDA5DqG-JICJIhJij3x2dfG7esi8AOGlhk1vF3tNsUQk03tVz0MOsOKoxcvEmQ7WcsT7fQwEsJY4Xstdr-Ry2o-N2rfyos5deVzpSdjzqlFM3jArSV1U4DlyB9vsl0F_ZWakpEH4rp_rLuxMCHQOgtpz_h0WnN5_2jllbOrUfG0QCK5JmGSZMhQQ8d4fKjBpRI6dZ52Mwpj_a0ws7GITtoS1R53q2bRy6Kk17RsF3Fd0Gg6ojnt6Tp7-RWb8v8Zt9wm1psek6duqxnRtpLjpYji-0ZE806IAql_ix3IqTj8bTlvOXpzXAb2TUxDJ0VRVVpV1myjG8catmsKibZMNW8Ea7y-HVZJMkDYIE2XnJVZoDBUHVBosSGi-GuE"}`,
      },
    });
    return response.data;
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