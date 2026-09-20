async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Pieprasījums neizdevās.');
  return payload;
}

export const api = {
  session: () => request('/auth/session'),
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  trucks: () => request('/trucks'),
  addTruck: (name, color) => request('/trucks', { method: 'POST', body: JSON.stringify({ name, color }) }),
  deleteTruck: (name) => request(`/trucks/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  entries: (truck) => request(`/entries${truck ? `?truck=${encodeURIComponent(truck)}` : ''}`),
  addEntry: (entry) => request('/entries', { method: 'POST', body: JSON.stringify(entry) }),
  users: () => request('/users'),
  addUser: (user) => request('/users', { method: 'POST', body: JSON.stringify(user) }),
  updatePassword: (id, password) => request(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
