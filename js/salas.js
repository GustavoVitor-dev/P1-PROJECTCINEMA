/**
 * salas.js — Cadastro e listagem de salas
 */

document.addEventListener('DOMContentLoaded', () => {

  const form     = document.getElementById('form-sala');
  const feedback = document.getElementById('feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const sala = {
      nome:       document.getElementById('nome').value.trim(),
      capacidade: parseInt(document.getElementById('capacidade').value),
      tipo:       document.getElementById('tipo').value
    };

    Storage.add('salas', sala);
    exibirFeedback('Sala salva com sucesso!', 'success');
    form.reset();
    renderizarSalas();
  });

  function renderizarSalas() {
    const lista = Storage.get('salas');
    const tbody = document.getElementById('lista-salas');

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted py-3">
            Nenhuma sala cadastrada ainda.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = lista.map(s => `
      <tr>
        <td class="fw-semibold">${s.nome}</td>
        <td>${s.capacidade} lugares</td>
        <td><span class="badge bg-dark">${s.tipo}</span></td>
      </tr>
    `).join('');
  }

  function exibirFeedback(msg, tipo) {
    feedback.textContent = msg;
    feedback.className = `alert alert-${tipo} feedback-alert`;
    feedback.style.display = 'block';
    setTimeout(() => (feedback.style.display = 'none'), 3000);
  }

  renderizarSalas();

});
