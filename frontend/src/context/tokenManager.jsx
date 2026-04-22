let memoryToken = null;

export const tokenManager = {
  getToken: () => memoryToken,
  setToken: (token) => { memoryToken = token; },
  clearToken: () => { memoryToken = null; }
};