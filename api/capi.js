// ============================================================
// Conversions API do Meta (eventos enviados pelo servidor)
//
// O TOKEN NUNCA FICA AQUI. Ele vem da variável de ambiente
// FB_CAPI_TOKEN, configurada no painel da Vercel. Sem ela, a
// função não envia nada e a página continua funcionando
// normalmente, só com o pixel do navegador.
//
// A página chama POST /api/capi mandando o mesmo event_id que o
// fbq usou no navegador, e o Meta usa esse id para deduplicar —
// ou seja, contar uma conversão só.
// ============================================================

const PIXEL_ID = '1631988885214161';
const API_VERSION = 'v21.0';

// o endpoint é público, então só estes eventos são aceitos
const ALLOWED_EVENTS = ['PageView', 'ViewContent', 'InitiateCheckout'];

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach(function (part) {
    const i = part.indexOf('=');
    if (i < 0) return;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || undefined;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const token = process.env.FB_CAPI_TOKEN;
  if (!token) {
    // sem token configurado: não é erro, só não envia
    res.status(204).end();
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  const eventName = String(body.event_name || '');
  if (ALLOWED_EVENTS.indexOf(eventName) === -1) {
    res.status(400).json({ error: 'event not allowed' });
    return;
  }

  const cookies = parseCookies(req.headers.cookie);
  const userData = {
    client_user_agent: req.headers['user-agent'],
    client_ip_address: clientIp(req),
  };
  if (cookies._fbp) userData.fbp = cookies._fbp;
  if (cookies._fbc) userData.fbc = cookies._fbc;
  else if (body.fbc) userData.fbc = String(body.fbc);

  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: String(body.event_id || ''),
    event_source_url: String(body.event_source_url || ''),
    action_source: 'website',
    user_data: userData,
  };
  if (body.custom_data && typeof body.custom_data === 'object') {
    event.custom_data = body.custom_data;
  }

  const payload = { data: [event] };
  if (process.env.FB_CAPI_TEST_CODE) {
    // só para o "Testar eventos" do Gerenciador de Eventos
    payload.test_event_code = process.env.FB_CAPI_TEST_CODE;
  }

  try {
    const r = await fetch(
      'https://graph.facebook.com/' + API_VERSION + '/' + PIXEL_ID + '/events?access_token=' + encodeURIComponent(token),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    const out = await r.json().catch(function () { return {}; });
    if (!r.ok) {
      console.error('CAPI erro', r.status, JSON.stringify(out));
      res.status(502).json({ ok: false });
      return;
    }
    res.status(200).json({ ok: true, events_received: out.events_received });
  } catch (err) {
    console.error('CAPI falhou', err && err.message);
    res.status(502).json({ ok: false });
  }
};
