// Minimal Telegram Bot API client over fetch (long polling). No extra dependencies.

export function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export class Telegram {
  constructor(token) {
    this.base = `https://api.telegram.org/bot${token}`;
    this.offset = 0;
  }

  async call(method, params = {}) {
    const res = await fetch(`${this.base}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(`Telegram ${method}: ${json.description}`);
    return json.result;
  }

  send(chatId, html, extra = {}) {
    return this.call('sendMessage', {
      chat_id: chatId, text: html, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, ...extra,
    });
  }

  async *updates() {
    for (;;) {
      try {
        const batch = await this.call('getUpdates', {
          offset: this.offset, timeout: 30, allowed_updates: ['message', 'callback_query'],
        });
        for (const u of batch) {
          this.offset = u.update_id + 1;
          yield u;
        }
      } catch (e) {
        console.error('[telegram]', e.message);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
}
