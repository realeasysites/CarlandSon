(function () {
  'use strict';
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  document.getElementById('year').textContent = new Date().getFullYear();

  // Gallery: any photo in /public/images/gallery shows up here automatically.
  var gallery = document.getElementById('gallery');
  function placeholders() {
    var labels = ['Commercial LVT', 'Basement LVP', 'Floor prep', 'Office tile', 'Finished space'];
    gallery.innerHTML = labels.map(function (l) {
      return '<figure class="ph"><div><strong>' + l + '</strong>Project photo coming soon</div></figure>';
    }).join('');
  }
  fetch('/api/gallery').then(function (r) { return r.json(); }).then(function (items) {
    if (!items.length) return placeholders();
    gallery.innerHTML = '';
    items.forEach(function (it) {
      var fig = document.createElement('figure');
      var img = document.createElement('img');
      img.src = it.src; img.alt = it.alt || 'Flooring project by Carl\'s & Son'; img.loading = 'lazy';
      fig.appendChild(img);
      if (it.alt) { var cap = document.createElement('figcaption'); cap.textContent = it.alt; fig.appendChild(cap); }
      gallery.appendChild(fig);
    });
  }).catch(placeholders);

  // Quote form
  var form = document.getElementById('quote-form');
  var msg = document.getElementById('form-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = Object.fromEntries(new FormData(form).entries());
    msg.className = 'form__msg';
    if (!data.name.trim()) { msg.textContent = 'Please add your name.'; msg.classList.add('err'); return; }
    if (!data.phone.trim() && !data.email.trim()) { msg.textContent = 'Please add a phone number or email so we can reach you.'; msg.classList.add('err'); return; }
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending…';
    fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.error || 'Something went wrong.');
        form.reset();
        msg.textContent = 'Thanks! Carlos will be in touch soon. Need it faster? Call 207-415-9599.';
        msg.classList.add('ok');
      })
      .catch(function (err) { msg.textContent = err.message + ' You can also call 207-415-9599.'; msg.classList.add('err'); })
      .finally(function () { btn.disabled = false; btn.textContent = 'Request My Free Estimate'; });
  });

  // Scroll reveal
  if ('IntersectionObserver' in window) {
    var els = document.querySelectorAll('.card, .steps li, .about__media, .about__copy, .faq details, .section__head');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .12 });
    els.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
