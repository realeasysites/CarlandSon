(function () {
  'use strict';
  var state = { leads: [], statuses: [], filter: 'all' };
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function api(url, opts) {
    return fetch(url, opts).then(function (r) {
      if (r.status === 401) { location.href = '/admin/login'; throw new Error('signed out'); }
      return r.json();
    });
  }
  function load() { api('/admin/api/leads').then(function (d) { state.leads = d.leads; state.statuses = d.statuses; render(); }); }

  function render() {
    var counts = { all: state.leads.length };
    state.statuses.forEach(function (s) { counts[s] = 0; });
    state.leads.forEach(function (l) { counts[l.status] = (counts[l.status] || 0) + 1; });
    $('stats').innerHTML = ['all'].concat(state.statuses).map(function (s) {
      return '<div class="stat"><b>' + counts[s] + '</b><span>' + (s === 'all' ? 'total leads' : s) + '</span></div>';
    }).join('');
    $('filters').innerHTML = ['all'].concat(state.statuses).map(function (s) {
      return '<button data-f="' + s + '" class="' + (state.filter === s ? 'on' : '') + '">' + s + '</button>';
    }).join('');
    var rows = state.leads.filter(function (l) { return state.filter === 'all' || l.status === state.filter; });
    if (!rows.length) { $('list').innerHTML = '<p class="empty">No leads here yet.</p>'; return; }
    $('list').innerHTML = rows.map(function (l) {
      var when = new Date(l.created_at.replace(' ', 'T') + 'Z').toLocaleString();
      var opts = state.statuses.map(function (s) { return '<option' + (s === l.status ? ' selected' : '') + '>' + s + '</option>'; }).join('');
      return '<article class="lead" data-id="' + l.id + '" data-status="' + esc(l.status) + '">' +
        '<div class="lead__top"><div><h2>' + esc(l.name) + '</h2><time>' + esc(when) + '</time></div>' +
        '<div class="actions"><select data-act="status" aria-label="Status">' + opts + '</select>' +
        '<button class="del" data-act="delete">Delete</button></div></div>' +
        '<div class="meta">' +
        '<div><b>Phone:</b> ' + (l.phone ? '<a href="tel:' + esc(l.phone) + '">' + esc(l.phone) + '</a>' : '—') + '</div>' +
        '<div><b>Email:</b> ' + (l.email ? '<a href="mailto:' + esc(l.email) + '">' + esc(l.email) + '</a>' : '—') + '</div>' +
        '<div><b>Property:</b> ' + esc(l.property_type || '—') + '</div>' +
        '<div><b>Service:</b> ' + esc(l.service || '—') + '</div>' +
        '<div><b>Sq ft:</b> ' + esc(l.sqft || '—') + '</div>' +
        '<div><b>Location:</b> ' + esc(l.location || '—') + '</div>' +
        '<div><b>Timeline:</b> ' + esc(l.timeline || '—') + '</div></div>' +
        (l.message ? '<div class="msg">' + esc(l.message) + '</div>' : '') +
        '<textarea data-act="notes" placeholder="Private notes (saves automatically)">' + esc(l.notes) + '</textarea>' +
        '</article>';
    }).join('');
  }

  $('filters').addEventListener('click', function (e) {
    var f = e.target.getAttribute('data-f'); if (!f) return;
    state.filter = f; render();
  });
  $('list').addEventListener('change', function (e) {
    var card = e.target.closest('.lead'); if (!card) return;
    var id = card.getAttribute('data-id');
    var body = e.target.dataset.act === 'status' ? { status: e.target.value } : e.target.dataset.act === 'notes' ? { notes: e.target.value } : null;
    if (!body) return;
    api('/admin/api/leads/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function () {
      var lead = state.leads.find(function (l) { return String(l.id) === id; });
      Object.assign(lead, body);
      if (body.status) render();
    });
  });
  $('list').addEventListener('click', function (e) {
    if (e.target.dataset.act !== 'delete') return;
    var card = e.target.closest('.lead');
    var name = card.querySelector('h2').textContent;
    if (!confirm('Delete the lead from "' + name + '"? This can\'t be undone.')) return;
    api('/admin/api/leads/' + card.getAttribute('data-id'), { method: 'DELETE' }).then(load);
  });
  $('logout').addEventListener('click', function () { fetch('/admin/logout', { method: 'POST' }).then(function () { location.href = '/admin/login'; }); });
  load();
})();
