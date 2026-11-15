/**
 *  Класс модального окна.
 *  Умеет показывать форму добавления/редактирования тикета
 *  и окно подтверждения удаления.
 * */
export default class TicketForm {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay hidden';
    this.overlay.innerHTML = `
      <form class="modal" novalidate>
        <h2 class="modal__title"></h2>
        <div class="modal__body"></div>
        <p class="modal__error hidden"></p>
        <div class="modal__buttons">
          <button type="button" class="btn" data-action="cancel">Отмена</button>
          <button type="submit" class="btn" data-action="ok">Ok</button>
        </div>
      </form>
    `;
    document.body.append(this.overlay);

    this.form = this.overlay.querySelector('.modal');
    this.title = this.overlay.querySelector('.modal__title');
    this.body = this.overlay.querySelector('.modal__body');
    this.error = this.overlay.querySelector('.modal__error');
    this.okBtn = this.overlay.querySelector('[data-action="ok"]');

    this.onSubmit = null;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
    this.overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => this.close());
    this.overlay.addEventListener('mousedown', (e) => {
      if (e.target === this.overlay) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) this.close();
    });
  }

  /**
   * Форма добавления / редактирования
   * @param {Object} opts
   * @param {string} opts.title
   * @param {Ticket} [opts.ticket] - заполняет поля при редактировании
   * @param {Function} opts.onSubmit - async ({ name, description }) => void
   */
  openEdit({ title, ticket = null, onSubmit }) {
    this.title.textContent = title;
    this.body.innerHTML = `
      <label class="modal__label">Краткое описание
        <input class="modal__input" name="name" type="text" required autocomplete="off">
      </label>
      <label class="modal__label">Подробное описание
        <textarea class="modal__input modal__textarea" name="description" rows="3"></textarea>
      </label>
    `;
    const { name, description } = this.form.elements;
    if (ticket) {
      name.value = ticket.name || '';
      description.value = ticket.description || '';
    }

    this.onSubmit = async () => {
      const data = { name: name.value.trim(), description: description.value.trim() };
      if (!data.name) {
        this.showError('Заполните краткое описание');
        name.focus();
        return false;
      }
      await onSubmit(data);
      return true;
    };

    this.show();
    name.focus();
  }

  /**
   * Окно подтверждения
   */
  openConfirm({ title, text, onSubmit }) {
    this.title.textContent = title;
    this.body.innerHTML = '<p class="modal__text"></p>';
    this.body.querySelector('.modal__text').textContent = text;
    this.onSubmit = async () => {
      await onSubmit();
      return true;
    };
    this.show();
    this.okBtn.focus();
  }

  async submit() {
    if (!this.onSubmit || this.okBtn.disabled) return;
    this.hideError();
    this.okBtn.disabled = true;
    try {
      const done = await this.onSubmit();
      if (done) this.close();
    } catch (err) {
      this.showError(err.message || 'Не удалось выполнить запрос');
    } finally {
      this.okBtn.disabled = false;
    }
  }

  showError(message) {
    this.error.textContent = message;
    this.error.classList.remove('hidden');
  }

  hideError() {
    this.error.textContent = '';
    this.error.classList.add('hidden');
  }

  show() {
    this.hideError();
    this.overlay.classList.remove('hidden');
  }

  close() {
    this.overlay.classList.add('hidden');
    this.body.innerHTML = '';
    this.onSubmit = null;
  }
}
