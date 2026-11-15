/**
 *  Класс для отображения тикетов на странице.
 *  Он содержит методы для генерации разметки тикета.
 * */
export default class TicketView {
  static formatDate(timestamp) {
    const date = new Date(timestamp);
    const pad = (n) => String(n).padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  /**
   * Создаёт DOM-элемент тикета
   * @param {Ticket} ticket
   * @returns {HTMLElement}
   */
  render(ticket) {
    const el = document.createElement('li');
    el.className = 'ticket';
    el.dataset.id = ticket.id;
    if (ticket.status) el.classList.add('ticket_done');

    el.innerHTML = `
      <div class="ticket__row">
        <button type="button" class="ticket__status round-btn" data-action="status"
          title="Отметить выполнение" aria-pressed="${ticket.status ? 'true' : 'false'}">
          ${ticket.status ? '&#10004;' : ''}
        </button>
        <div class="ticket__name"></div>
        <time class="ticket__created"></time>
        <div class="ticket__actions">
          <button type="button" class="round-btn" data-action="edit" title="Редактировать">&#9998;</button>
          <button type="button" class="round-btn" data-action="delete" title="Удалить">x</button>
        </div>
      </div>
      <div class="ticket__description hidden"></div>
    `;

    // текст вставляем через textContent, чтобы не было XSS
    el.querySelector('.ticket__name').textContent = ticket.name;
    const time = el.querySelector('.ticket__created');
    time.textContent = TicketView.formatDate(ticket.created);
    time.dateTime = new Date(ticket.created).toISOString();

    return el;
  }

  /**
   * Показывает подробное описание внутри тикета
   */
  showDescription(el, description) {
    const descEl = el.querySelector('.ticket__description');
    descEl.textContent = description || 'Подробное описание отсутствует';
    descEl.classList.toggle('ticket__description_empty', !description);
    descEl.classList.remove('hidden');
    el.classList.add('ticket_expanded');
  }

  hideDescription(el) {
    el.querySelector('.ticket__description').classList.add('hidden');
    el.classList.remove('ticket_expanded');
  }
}
