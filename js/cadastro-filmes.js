/**
 * cadastro-filmes.js — CRUD completo de filmes
 *
 * ✔ Criar   — formulário lateral
 * ✔ Ler     — tabela renderizada a partir do localStorage
 * ✔ Editar  — modal Bootstrap pré-preenchido; atualiza dependentes via ID
 * ✔ Excluir — confirmação + cascata (sessões → ingressos)
 */

document.addEventListener('DOMContentLoaded', () => {

  const form     = document.getElementById('form-filme');
  const feedback = document.getElementById('feedback');

  // ── Modal de edição ──────────────────────────────────────
  const modalEl       = document.getElementById('modal-editar-filme');
  const modal         = new bootstrap.Modal(modalEl);
  const modalForm     = document.getElementById('form-editar-filme');
  let   editandoId    = null;      // ID do registro em edição

  // Abre o modal de edição ao clicar em ✏️
  document.getElementById('lista-filmes').addEventListener('click', (e) => {
    // ── Editar ──────────────────────────────────────────────
    const btnEditar = e.target.closest('.btn-editar');
    if (btnEditar) {
      editandoId = Number(btnEditar.dataset.id);
      const f    = Storage.findById('filmes', editandoId);
      if (!f) return;

      // Preenche os campos do modal
      modalForm.querySelector('#edit-titulo').value        = f.titulo;
      modalForm.querySelector('#edit-genero').value        = f.genero;
      modalForm.querySelector('#edit-descricao').value     = f.descricao;
      modalForm.querySelector('#edit-classificacao').value = f.classificacao;
      modalForm.querySelector('#edit-duracao').value       = f.duracao;
      modalForm.querySelector('#edit-estreia').value       = f.estreia;

      document.getElementById('modal-feedback').style.display = 'none';
      modal.show();
      return;
    }

    // ── Excluir ─────────────────────────────────────────────
    const btnExcluir = e.target.closest('.btn-excluir');
    if (!btnExcluir) return;

    const id   = Number(btnExcluir.dataset.id);
    const nome = btnExcluir.dataset.nome;

    const sessoes   = Storage.get('sessoes').filter(s => s.filmeId === id);
    const ingressos = sessoes.reduce((acc, s) =>
      acc + Storage.get('ingressos').filter(i => i.sessaoId === s.id).length, 0);

    let msg = `Deseja excluir o filme "${nome}"?`;
    if (sessoes.length > 0) {
      msg += `\n\nAtenção: isso também excluirá ${sessoes.length} sessão(ões)`;
      if (ingressos > 0) msg += ` e ${ingressos} ingresso(s) vinculado(s)`;
      msg += '.';
    }

    if (!confirm(msg)) return;

    const resultado = Storage.remove('filmes', id);
    if (resultado.removido) {
      let feedbackMsg = 'Filme excluído.';
      if (resultado.cascata.sessoes   > 0) feedbackMsg += ` ${resultado.cascata.sessoes} sessão(ões) removida(s).`;
      if (resultado.cascata.ingressos > 0) feedbackMsg += ` ${resultado.cascata.ingressos} ingresso(s) removido(s).`;
      exibirFeedback(feedbackMsg, 'warning');
      renderizarFilmes();
    }
  });

  // Salva edição ao submeter o formulário do modal
  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const titulo        = modalForm.querySelector('#edit-titulo').value.trim();
    const genero        = modalForm.querySelector('#edit-genero').value;
    const descricao     = modalForm.querySelector('#edit-descricao').value.trim();
    const classificacao = modalForm.querySelector('#edit-classificacao').value;
    const duracao       = modalForm.querySelector('#edit-duracao').value;
    const estreia       = modalForm.querySelector('#edit-estreia').value;

    const erros = [];
    if (!titulo)                         erros.push('Título');
    if (!genero)                         erros.push('Gênero');
    if (!descricao)                      erros.push('Descrição');
    if (!classificacao)                  erros.push('Classificação');
    if (!duracao || Number(duracao) < 1) erros.push('Duração');
    if (!estreia)                        erros.push('Data de Estreia');

    if (erros.length > 0) {
      exibirModalFeedback(`Preencha: ${erros.join(', ')}.`, 'danger');
      return;
    }

    Storage.update('filmes', editandoId, {
      titulo, genero, descricao, classificacao,
      duracao: parseInt(duracao), estreia
    });

    modal.hide();
    exibirFeedback('Filme atualizado! As sessões vinculadas refletem as mudanças automaticamente.', 'success');
    renderizarFilmes();
  });

  // ── Cadastro (formulário lateral) ────────────────────────

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titulo        = document.getElementById('titulo').value.trim();
    const genero        = document.getElementById('genero').value;
    const descricao     = document.getElementById('descricao').value.trim();
    const classificacao = document.getElementById('classificacao').value;
    const duracao       = document.getElementById('duracao').value;
    const estreia       = document.getElementById('estreia').value;

    const erros = [];
    if (!titulo)                         erros.push('Título');
    if (!genero)                         erros.push('Gênero');
    if (!descricao)                      erros.push('Descrição');
    if (!classificacao)                  erros.push('Classificação Indicativa');
    if (!duracao || Number(duracao) < 1) erros.push('Duração');
    if (!estreia)                        erros.push('Data de Estreia');

    if (erros.length > 0) {
      exibirFeedback(`Preencha os campos obrigatórios: ${erros.join(', ')}.`, 'danger');
      return;
    }

    Storage.add('filmes', {
      titulo, genero, descricao, classificacao,
      duracao: parseInt(duracao), estreia
    });

    exibirFeedback('Filme salvo com sucesso!', 'success');
    form.reset();
    renderizarFilmes();
  });

  // ── Renderização da tabela ───────────────────────────────

  function renderizarFilmes() {
    const lista = Storage.get('filmes');
    const tbody = document.getElementById('lista-filmes');

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-3">
            Nenhum filme cadastrado ainda.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = lista.map(f => `
      <tr>
        <td class="fw-semibold">${f.titulo}</td>
        <td>${f.genero}</td>
        <td><span class="badge bg-secondary">${f.classificacao}</span></td>
        <td>${f.duracao} min</td>
        <td>${formatarData(f.estreia)}</td>
        <td class="text-center acoes-col">
          <button class="btn btn-editar btn-sm"
                  data-id="${f.id}"
                  title="Editar filme">✏️</button>
          <button class="btn btn-excluir btn-sm"
                  data-id="${f.id}"
                  data-nome="${f.titulo.replace(/"/g, '&quot;')}"
                  title="Excluir filme">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  // ── Utilitários ─────────────────────────────────────────

  function formatarData(dataISO) {
    if (!dataISO) return '—';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function exibirFeedback(msg, tipo) {
    feedback.textContent = msg;
    feedback.className   = `alert alert-${tipo} feedback-alert`;
    feedback.style.display = 'block';
    setTimeout(() => (feedback.style.display = 'none'), 4000);
  }

  function exibirModalFeedback(msg, tipo) {
    const el = document.getElementById('modal-feedback');
    el.textContent = msg;
    el.className   = `alert alert-${tipo} mt-2 mb-0`;
    el.style.display = 'block';
  }

  renderizarFilmes();

});
