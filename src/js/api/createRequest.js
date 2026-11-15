/* global API_URL */
/**
 * Базовый адрес сервера.
 * Подставляется Webpack'ом при сборке (переменная окружения API_URL),
 * по умолчанию — локальный сервер.
 */
const BASE_URL = typeof API_URL !== 'undefined' && API_URL ? API_URL : 'http://localhost:7070';

/**
 * Универсальная функция запроса к серверу.
 *
 * @param {Object} options
 * @param {string} options.method - HTTP-метод (GET, POST)
 * @param {Object} options.params - query-параметры (method, id)
 * @param {Object} [options.data] - тело запроса (будет сериализовано в JSON)
 * @returns {Promise<any>} - распарсенный JSON-ответ или null (для 204)
 */
const createRequest = async (options = {}) => {
  const { method = 'GET', params = {}, data } = options;

  const url = new URL(BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const init = { method };
  if (data !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(data);
  }

  const response = await fetch(url, init);

  if (!response.ok) {
    let message = `Ошибка сервера: ${response.status}`;
    try {
      const error = await response.json();
      if (error && error.message) message = error.message;
    } catch (e) {
      // тело ответа пустое или не JSON
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export default createRequest;
