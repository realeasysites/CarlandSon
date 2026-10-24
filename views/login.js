document.getElementById('login').addEventListener('submit', function (e) {
  e.preventDefault();
  var err = document.getElementById('err');
  err.textContent = '';
  fetch('/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: this.password.value }) })
    .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
    .then(function (res) { if (res.ok) location.href = '/admin'; else err.textContent = res.j.error || 'Login failed.'; })
    .catch(function () { err.textContent = 'Network error.'; });
});
