'use client';
// Sağ altta oyun arkadaşlarıyla birebir sohbet widget'ı (canlı destek DEĞİL —
// panelde açıkça yazar). Metinler lib/i18n.js'ten; eksik çeviri build'i düşürür.
import { useEffect, useRef, useState } from 'react';
import { t as strictT, validateTranslations } from '../../lib/i18n';

if (process.env.NODE_ENV !== 'production') {
  validateTranslations();
}

function useChatT() {
  const [lang, setLang] = useState('tr');
  useEffect(() => {
    try {
      let l = localStorage.getItem('hm_lang');
      if (!l) l = (navigator.language || 'tr').slice(0, 2).toLowerCase();
      setLang(['tr', 'en', 'fr', 'es'].includes(l) ? l : 'tr');
    } catch { /* özel mod */ }
  }, []);
  return (key) => strictT(lang, key);
}

export default function ChatWidget({ user }) {
  const t = useChatT();
  const me = user && user.playerName ? user.playerName : null;
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [active, setActive] = useState(null);     // 当前聊天对象
  const [history, setHistory] = useState([]);     // [{from, body, ts}]
  const [typing, setTyping] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [input, setInput] = useState('');
  const wsRef = useRef(null);
  const activeRef = useRef(null);
  const boxRef = useRef(null);
  const rateRef = useRef([]);

  activeRef.current = active;

  useEffect(() => {
    if (!me) return;
    let closed = false;
    let timer = null;
    function connect() {
      if (closed) return;
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${location.host}/ws/chat`);
      wsRef.current = ws;
      ws.onmessage = ev => {
        let m = null;
        try { m = JSON.parse(ev.data); } catch { return; }
        if (!m) return;
        if (m.t === 'friends') {
          setFriends(m.list || []);
        } else if (m.t === 'presence') {
          setFriends(fs => fs.map(f => f.name === m.name ? { ...f, online: m.value } : f));
        } else if (m.t === 'msg') {
          if (activeRef.current === m.from) {
            setHistory(h => [...h, { from: m.from, body: m.body, ts: m.ts }]);
            ws.send(JSON.stringify({ t: 'read', with: m.from }));
          } else {
            setFriends(fs => fs.map(f => f.name === m.from ? { ...f, unread: (f.unread || 0) + 1 } : f));
          }
        } else if (m.t === 'sent') {
          if (activeRef.current === m.to) setHistory(h => [...h, { from: 'me', body: m.body, ts: m.ts }]);
        } else if (m.t === 'typing') {
          if (activeRef.current === m.from) {
            setTyping(true);
            setTimeout(() => setTyping(false), 2500);
          }
        } else if (m.t === 'unread') {
          setUnreadTotal(m.total || 0);
        }
      };
      ws.onclose = () => { if (!closed) timer = setTimeout(connect, 5000); };
    }
    connect();
    return () => { closed = true; clearTimeout(timer); try { wsRef.current && wsRef.current.close(); } catch {} };
  }, [me]);

  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [history, typing]);

  function openChat(name) {
    setActive(name);
    setHistory([]);
    fetch('/api/chat/history?with=' + encodeURIComponent(name))
      .then(r => r.json())
      .then(j => setHistory((j.messages || []).map(m => ({ from: m.from, body: m.body, ts: m.ts }))));
    setFriends(fs => fs.map(f => f.name === name ? { ...f, unread: 0 } : f));
    if (wsRef.current) wsRef.current.send(JSON.stringify({ t: 'read', with: name }));
  }

  function sendMsg(e) {
    e.preventDefault();
    const txt = input.trim();
    if (!txt || !wsRef.current || !active) return;
    rateRef.current = rateRef.current.filter(t => Date.now() - t < 10000);
    if (rateRef.current.length >= 10) return;
    rateRef.current.push(Date.now());
    wsRef.current.send(JSON.stringify({ t: 'msg', to: active, body: txt }));
    setInput('');
  }

  function onInput() {
    if (wsRef.current && input.trim() && active) {
      wsRef.current.send(JSON.stringify({ t: 'typing', to: active }));
    }
  }

  const unreadShown = unreadTotal || friends.reduce((s, f) => s + (f.unread || 0), 0);

  return (
    <div id="hm-chat-root">
      <button id="hmchat-btn" title={t('chat.title')} onClick={() => setOpen(o => !o)}>
        <span>💬</span>
        {unreadShown > 0 && <i id="hmchat-badge">{unreadShown > 99 ? '99+' : unreadShown}</i>}
      </button>
      <div id="hmchat-panel" className={open ? '' : 'hide'}>
        <div className="hmc-head">
          {active
            ? <button className="hmc-ico" onClick={() => setActive(null)}>←</button>
            : <span />}
          <span className="hmc-title">🧀 {t('chat.title')}{active ? ` · ${active}` : ''}</span>
          <button className="hmc-ico" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div id="hmchat-body">
          <div className="hmc-hint">{t('chat.hint')}</div>
          {!me ? (
            <div className="hmc-login">
              <div style={{ fontSize: 34 }}>🧀</div>
              <p>{t('chat.loginText')}</p>
              <a className="btn btn-play btn-sm" href="/giris?geri=%2F">{t('chat.loginBtn')}</a>
            </div>
          ) : active ? (
            <>
              <div className="hmc-chat" ref={boxRef}>
                {history.length === 0 && !typing && <div className="hmc-history">{t('chat.empty')}</div>}
                {history.map((m, i) => (
                  <div key={i} className={'hmc-bub' + (m.from === me ? ' mine' : '')}>
                    <span>{m.body}</span>
                    <span className="hmc-ts">{new Date(m.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
                {typing && <div className="hmc-bub hmc-typing">{t('chat.typing')}</div>}
              </div>
              <form id="hmc-form" onSubmit={sendMsg}>
                <input
                  id="hmc-input" maxLength={500} autoComplete="off"
                  placeholder={t('chat.placeholder')} value={input}
                  onChange={e => setInput(e.target.value)} onInput={onInput}
                />
                <button className="hmc-send">➤</button>
              </form>
            </>
          ) : friends.length ? (
            <div className="hmc-list">
              {friends.map(f => (
                <div key={f.name} className={'hmc-item' + (f.online ? ' on' : '')} onClick={() => openChat(f.name)}>
                  <span className="hmc-av">{f.online ? '🟢' : '⚫'}</span>
                  <span className="hmc-name">{f.name}</span>
                  {f.unread ? <span className="hmc-unread">{f.unread}</span> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="hmc-login">
              <div style={{ fontSize: 34 }}>🐭</div>
              <p>{t('chat.noFriends')}</p>
              <a className="btn btn-ghost btn-sm" href="/play">🧀 {t('chat.noFriendsBtn')}</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
