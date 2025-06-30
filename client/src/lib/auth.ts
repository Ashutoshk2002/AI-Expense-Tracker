// Token management utilities
export const getToken = (): string | null => {
  return localStorage.getItem("paisa_token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("paisa_token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("paisa_token");
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
};
