import TicketView from './TicketView';
import TicketForm from './TicketForm';

/**
 *  Основной класс приложения
 * */
export default class HelpDesk {
  constructor(container, ticketService) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('This is not HTML element!');
    }
    this.container = container;
    this.ticketService = ticketService;
    this.view = new TicketView();
    this.tickets = [];
    this.pending = 0;
  }

  init() {
    this.container.innerHTML = `
      <div class="helpdesk">
        <div class="helpdesk__header">
          <button type="button" class="btn helpdesk__add">Добавить тикет</button>
        </div>
        <div class="helpdesk__error hidden"></div>
        <ul class="helpdesk__list"></ul>
        <div class="loader hidden" aria-label="Загрузка"><div class="loader__spinner"></div></div>
      </div>
    `;
    this.list = this.container.querySelector('.helpdesk__list');
    this.loader = this.container.querySelector('.loader');
    this.errorEl = this.container.querySelector('.helpdesk__error');
    this.form = new TicketForm();

    this.container.querySelector('.helpdesk__add').addEventListener('click', () => this.onAdd());
    this.list.addEventListener('click', (e) => this.onListClick(e));

    this.loadTickets();
  }

  /**
   * Обёртка: показывает лоадер на время запроса
   */
  async withLoader(fn) {
    this.pending += 1;
    this.loader.classList.remove('hidden');
    try {
      return await fn();
    } finally {
      this.pending -= 1;
      if (this.pending === 0) this.loader.classList.add('hidden');
    }
  }

  showError(message) {
    this.errorEl.textContent = message;
    this.errorEl.classList.remove('hidden');
  }

  hideError() {
    this.errorEl.classList.add('hidden');
  }

  async loadTickets() {
    try {
      this.tickets = await this.withLoader(() => this.ticketService.list());
      this.hideError();
      this.renderTickets();
    } catch (err) {
      this.showError(`Не удалось загрузить тикеты: ${err.message}`);
    }
  }

  renderTickets() {
    this.list.innerHTML = '';
    if (this.tickets.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'helpdesk__empty';
      empty.textContent = 'Тикетов пока нет';
      this.list.append(empty);
      return;
    }
    this.tickets.forEach((ticket) => this.list.append(this.view.render(ticket)));
  }

  findTicket(id) {
    return this.tickets.find((t) => t.id === id);
  }

  onListClick(e) {
    const ticketEl = e.target.closest('.ticket');
    if (!ticketEl) return;
    const { id } = ticketEl.dataset;
    const button = e.target.closest('[data-action]');

    if (!button) {
      this.toggleDescription(ticketEl, id);
      return;
    }

    switch (button.dataset.action) {
      case 'status':
        this.toggleStatus(id);
        break;
      case 'edit':
        this.onEdit(id);
        break;
      case 'delete':
        this.onDelete(id);
        break;
      default:
        break;
    }
  }

  /**
   * Подробное описание грузится отдельным запросом
   */
  async toggleDescription(ticketEl, id) {
    if (ticketEl.classList.contains('ticket_expanded')) {
      this.view.hideDescription(ticketEl);
      return;
    }
    try {
      const ticket = await this.withLoader(() => this.ticketService.get(id));
      this.view.showDescription(ticketEl, ticket.description);
      this.hideError();
    } catch (err) {
      this.showError(`Не удалось загрузить описание: ${err.message}`);
    }
  }

  async toggleStatus(id) {
    const ticket = this.findTicket(id);
    if (!ticket) return;
    try {
      await this.withLoader(() => this.ticketService.update(id, { status: !ticket.status }));
      await this.loadTickets();
    } catch (err) {
      this.showError(`Не удалось изменить статус: ${err.message}`);
    }
  }

  onAdd() {
    this.form.openEdit({
      title: 'Добавить тикет',
      onSubmit: async (data) => {
        await this.withLoader(() => this.ticketService.create(data));
        await this.loadTickets();
      },
    });
  }

  async onEdit(id) {
    let ticket;
    try {
      // берём полную версию тикета (с description) с сервера
      ticket = await this.withLoader(() => this.ticketService.get(id));
    } catch (err) {
      this.showError(`Не удалось загрузить тикет: ${err.message}`);
      return;
    }
    this.form.openEdit({
      title: 'Изменить тикет',
      ticket,
      onSubmit: async (data) => {
        await this.withLoader(() => this.ticketService.update(id, data));
        await this.loadTickets();
      },
    });
  }

  onDelete(id) {
    this.form.openConfirm({
      title: 'Удалить тикет',
      text: 'Вы уверены, что хотите удалить тикет? Это действие необратимо.',
      onSubmit: async () => {
        await this.withLoader(() => this.ticketService.delete(id));
        await this.loadTickets();
      },
    });
  }
}
