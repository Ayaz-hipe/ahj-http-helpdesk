import createRequest from './api/createRequest';
import Ticket from './Ticket';

/**
 *  Класс для связи с сервером.
 *  Содержит методы для отправки запросов на сервер и получения ответов.
 *  Все методы принимают callback вида (error, result) и, кроме того,
 *  возвращают Promise — можно использовать любой вариант.
 * */
export default class TicketService {
  static handle(promise, callback) {
    if (typeof callback === 'function') {
      promise.then((result) => callback(null, result)).catch((error) => callback(error));
    }
    return promise;
  }

  list(callback) {
    const promise = createRequest({ params: { method: 'allTickets' } }).then((data) =>
      data.map((item) => new Ticket(item)),
    );
    return TicketService.handle(promise, callback);
  }

  get(id, callback) {
    const promise = createRequest({ params: { method: 'ticketById', id } }).then((data) => new Ticket(data));
    return TicketService.handle(promise, callback);
  }

  create(data, callback) {
    const promise = createRequest({
      method: 'POST',
      params: { method: 'createTicket' },
      data: { id: null, status: false, ...data },
    }).then((result) => new Ticket(result));
    return TicketService.handle(promise, callback);
  }

  update(id, data, callback) {
    const promise = createRequest({
      method: 'POST',
      params: { method: 'updateById', id },
      data,
    });
    return TicketService.handle(promise, callback);
  }

  delete(id, callback) {
    const promise = createRequest({ params: { method: 'deleteById', id } });
    return TicketService.handle(promise, callback);
  }
}
