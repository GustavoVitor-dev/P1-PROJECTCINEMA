/**
 * salas.js — CRUD completo de salas
 *
 * ✔ Criar   — formulário lateral
 * ✔ Ler     — tabela renderizada a partir do localStorage
 * ✔ Editar  — modal Bootstrap pré-preenchido; dependentes refletem via ID
 * ✔ Excluir — confirmação + cascata (sessões → ingressos)
 */

document.addEventListener('DOMContentLoaded', () => {

  const form     = document.getElementById('form-sala');
  const feedback = document.getElementById('feedback');

  // ── Modal de edição ──────────────────────────────────────
  const modalEl    = document.getElementById('modal-editar-sala');
  const modal      = new bootstrap.Modal(modalEl);
  const modalForm  = document.getElementById('form-editar-sala');
  let   editandoId = null;

  document.getElementById('lista-salas').addEventListener('click', (e) => {
    // ── Editar ──────────────────────────────────────────────
    const btnEditar = e.target.closest('.btn-editar');
    if (btnEditar) {
      editandoId = Number(btnEditar.dataset.id);
      const s    = Storage.findById('salas', editandoId);
      if (!s) return;

      modalForm.querySelector('#edit-nome').value       = s.nome;
      modalForm.querySelector('#edit-capacidade').value = s.capacidade;
      modalForm.querySelector('#edit-tipo').value       = s.tipo;

      document.getElementById('modal-feedback').style.display = 'none';
      modal.show();
      return;
    }

    // ── Excluir ─────────────────────────────────────────────
    const btnExcluir = e.target.closest('.btn-excluir');
    if (!btnExcluir) return;

    const id   = Number(btnExcluir.dataset.id);
    const nome = btnExcluir.dataset.nome;

    const sessoes   = Storage.get('sessoes').filter(s => s.salaId === id);
    const ingressos = sessoes.reduce((acc, s) =>
      acc + Storage.get('ingressos').filter(i => i.sessaoId === s.id).length, 0);

    let msg = `Deseja excluir a sala "${nome}"?`;
    if (sessoes.length > 0) {
      msg += `\n\nAtenção: isso também excluirá ${sessoes.length} sessão(ões)`;
      if (ingressos > 0) msg += ` e ${ingressos} ingresso(s) vinculado(s)`;
      msg += '.';
    }

    if (!confirm(msg)) return;

    const resultado = Storage.remove('salas', id);
    if (resultado.removido) {
      let feedbackMsg = 'Sala excluída.';
      if (resultado.cascata.sessoes   > 0) feedbackMsg += ` ${resultado.cascata.sessoes} sessão(ões) removida(s).`;
      if (resultado.cascata.ingressos > 0) feedbackMsg += ` ${resultado.cascata.ingressos} ingresso(s) removido(s).`;
      exibirFeedback(feedbackMsg, 'warning');
      renderizarSalas();
    }
  });

  // Salva edição
  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome       = modalForm.querySelector('#edit-nome').value.trim();
    const capacidade = modalForm.querySelector('#edit-capacidade').value;
    const tipo       = modalForm.querySelector('#edit-tipo').value;

    const erros = [];
    if (!nome)                               erros.push('Nome da Sala');
    if (!capacidade || Number(capacidade) < 1) erros.push('Capacidade');
    if (!tipo)                               erros.push('Tipo');

    if (erros.length > 0) {
      exibirModalFeedback(`Preencha: ${erros.join(', ')}.`, 'danger');
      return;
    }

    Storage.update('salas', editandoId, {
      nome,
      capacidade: parseInt(capacidade),
      tipo
    });

    modal.hide();
    exibirFeedback('Sala atualizada! As sessões vinculadas refletem as mudanças automaticamente.', 'success');
    renderizarSalas();
  });

  // ── Cadastro (formulário lateral) ────────────────────────

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome       = document.getElementById('nome').value.trim();
    const capacidade = document.getElementById('capacidade').value;
    const tipo       = document.getElementById('tipo').value;

    const erros = [];
    if (!nome)                               erros.push('Nome da Sala');
    if (!capacidade || Number(capacidade) < 1) erros.push('Capacidade');
    if (!tipo)                               erros.push('Tipo');

    if (erros.length > 0) {
      exibirFeedback(`Preencha os campos obrigatórios: ${erros.join(', ')}.`, 'danger');
      return;
    }

    Storage.add('salas', { nome, capacidade: parseInt(capacidade), tipo });
    exibirFeedback('Sala salva com sucesso!', 'success');
    form.reset();
    renderizarSalas();
  });

  // ── Renderização da tabela ───────────────────────────────

  function renderizarSalas() {
    const lista = Storage.get('salas');
    const tbody = document.getElementById('lista-salas');

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted py-3">
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
        <td class="text-center acoes-col">
          <button class="btn btn-editar btn-sm"
                  data-id="${s.id}"
                  title="Editar sala">✏️</button>
          <button class="btn btn-excluir btn-sm"
                  data-id="${s.id}"
                  data-nome="${s.nome.replace(/"/g, '&quot;')}"
                  title="Excluir sala">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  // ── Utilitários ─────────────────────────────────────────

  function exibirFeedback(msg, tipo) {
    feedback.textContent   = msg;
    feedback.className     = `alert alert-${tipo} feedback-alert`;
    feedback.style.display = 'block';
    setTimeout(() => (feedback.style.display = 'none'), 4000);
  }

  function exibirModalFeedback(msg, tipo) {
    const el = document.getElementById('modal-feedback');
    el.textContent   = msg;
    el.className     = `alert alert-${tipo} mt-2 mb-0`;
    el.style.display = 'block';
  }

  renderizarSalas();

});
