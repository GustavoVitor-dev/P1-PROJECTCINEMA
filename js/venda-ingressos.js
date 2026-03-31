/**
 * venda-ingressos.js — CRUD completo de ingressos
 *
 * ✔ Criar   — formulário lateral (requer sessão)
 * ✔ Ler     — tabela renderizada a partir do localStorage
 * ✔ Editar  — modal Bootstrap pré-preenchido (select de sessão recarregado)
 * ✔ Excluir — confirmação simples
 */

document.addEventListener('DOMContentLoaded', () => {

  const form         = document.getElementById('form-venda');
  const feedback     = document.getElementById('feedback');
  const selectSessao = document.getElementById('sessao');
  const btnSubmit    = form.querySelector('button[type="submit"]');

  // ── Modal de edição ──────────────────────────────────────
  const modalEl    = document.getElementById('modal-editar-ingresso');
  const modal      = new bootstrap.Modal(modalEl);
  const modalForm  = document.getElementById('form-editar-ingresso');
  let   editandoId = null;

  // ── Carregamento do select de sessões ────────────────────

  function construirOpcoesSessionies(selectEl, valorSelecionado = '') {
    const sessoes = Storage.get('sessoes');
    const filmes  = Storage.get('filmes');
    const salas   = Storage.get('salas');

    selectEl.innerHTML = '<option value="">Selecione uma sessão</option>';

    if (sessoes.length === 0) {
      selectEl.innerHTML += '<option disabled>— Nenhuma sessão disponível —</option>';
      return;
    }

    sessoes.forEach(s => {
      const filme = filmes.find(f => f.id === s.filmeId);
      const sala  = salas.find(sl => sl.id === s.salaId);
      const [data, hora] = s.dataHora.split('T');
      const [ano, mes, dia] = data.split('-');

      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${filme?.titulo || '?'} — ${dia}/${mes}/${ano} ${hora} · ${sala?.nome || '?'}`;
      if (s.id === Number(valorSelecionado)) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  function carregarSessoes() {
    construirOpcoesSessionies(selectSessao);

    // Pré-seleciona via query string (?sessao=ID) quando vindo da programação
    const params   = new URLSearchParams(window.location.search);
    const sessaoId = params.get('sessao');
    if (sessaoId) selectSessao.value = sessaoId;
  }

  function verificarDependencias() {
    const avisoEl = document.getElementById('aviso-dependencia');

    if (!Storage.temSessoes()) {
      avisoEl.innerHTML     = `⚠️ Cadastre ao menos uma <a href="cadastro-sessoes.html">sessão</a> antes de vender ingressos.`;
      avisoEl.style.display = 'block';
      btnSubmit.disabled    = true;
    } else {
      avisoEl.style.display = 'none';
      btnSubmit.disabled    = false;
    }
  }

  // ── Delegação de clique (editar / excluir) ───────────────

  document.getElementById('lista-ingressos').addEventListener('click', (e) => {
    // ── Editar ───────────────────────────────────────────────
    const btnEditar = e.target.closest('.btn-editar');
    if (btnEditar) {
      editandoId = Number(btnEditar.dataset.id);
      const i    = Storage.findById('ingressos', editandoId);
      if (!i) return;

      // Popula select de sessões do modal com sessão atual pré-selecionada
      construirOpcoesSessionies(modalForm.querySelector('#edit-sessao'), i.sessaoId);

      modalForm.querySelector('#edit-nomeCliente').value    = i.nomeCliente;
      modalForm.querySelector('#edit-cpf').value            = i.cpf;
      modalForm.querySelector('#edit-assento').value        = i.assento;
      modalForm.querySelector('#edit-tipoPagamento').value  = i.tipoPagamento;

      document.getElementById('modal-feedback').style.display = 'none';
      modal.show();
      return;
    }

    // ── Excluir ──────────────────────────────────────────────
    const btnExcluir = e.target.closest('.btn-excluir');
    if (!btnExcluir) return;

    const id    = Number(btnExcluir.dataset.id);
    const label = btnExcluir.dataset.label;

    if (!confirm(`Deseja excluir o ingresso de "${label}"?`)) return;

    const resultado = Storage.remove('ingressos', id);
    if (resultado.removido) {
      exibirFeedback('Ingresso excluído.', 'warning');
      renderizarIngressos();
    }
  });

  // ── Salva edição ─────────────────────────────────────────

  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const sessaoId     = modalForm.querySelector('#edit-sessao').value;
    const nomeCliente  = modalForm.querySelector('#edit-nomeCliente').value.trim();
    const cpf          = modalForm.querySelector('#edit-cpf').value.trim();
    const assento      = modalForm.querySelector('#edit-assento').value.trim().toUpperCase();
    const tipoPagamento = modalForm.querySelector('#edit-tipoPagamento').value;

    const erros = [];
    if (!sessaoId)    erros.push('Sessão');
    if (!nomeCliente) erros.push('Nome do Cliente');
    if (!cpf)         erros.push('CPF');
    if (!assento)     erros.push('Assento');

    if (erros.length > 0) {
      exibirModalFeedback(`Preencha: ${erros.join(', ')}.`, 'danger');
      return;
    }

    Storage.update('ingressos', editandoId, {
      sessaoId: Number(sessaoId),
      nomeCliente, cpf, assento, tipoPagamento
    });

    modal.hide();
    exibirFeedback('Ingresso atualizado com sucesso!', 'success');
    renderizarIngressos();
  });

  // ── Cadastro (formulário principal) ──────────────────────

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const sessaoId     = selectSessao.value;
    const nomeCliente  = document.getElementById('nomeCliente').value.trim();
    const cpf          = document.getElementById('cpf').value.trim();
    const assento      = document.getElementById('assento').value.trim().toUpperCase();
    const tipoPagamento = document.getElementById('tipoPagamento').value;

    if (!Storage.temSessoes()) {
      exibirFeedback('Cadastre uma sessão antes de vender ingressos.', 'danger');
      return;
    }

    const erros = [];
    if (!sessaoId)    erros.push('Sessão');
    if (!nomeCliente) erros.push('Nome do Cliente');
    if (!cpf)         erros.push('CPF');
    if (!assento)     erros.push('Assento');

    if (erros.length > 0) {
      exibirFeedback(`Preencha os campos obrigatórios: ${erros.join(', ')}.`, 'danger');
      return;
    }

    Storage.add('ingressos', {
      sessaoId: Number(sessaoId),
      nomeCliente, cpf, assento, tipoPagamento
    });

    exibirFeedback('Ingresso confirmado com sucesso! 🎬', 'success');
    form.reset();
    carregarSessoes();
    renderizarIngressos();
  });

  // ── Renderização da tabela ───────────────────────────────

  function renderizarIngressos() {
    const ingressos = Storage.get('ingressos');
    const sessoes   = Storage.get('sessoes');
    const filmes    = Storage.get('filmes');
    const tbody     = document.getElementById('lista-ingressos');

    if (ingressos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-3">
            Nenhum ingresso vendido ainda.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = ingressos.map(i => {
      const sessao = sessoes.find(s => s.id === i.sessaoId);
      const filme  = sessao ? filmes.find(f => f.id === sessao.filmeId) : null;

      return `
        <tr>
          <td class="fw-semibold">${i.nomeCliente}</td>
          <td>${i.cpf}</td>
          <td>${filme ? filme.titulo : '—'}</td>
          <td><span class="badge bg-dark">${i.assento}</span></td>
          <td>${i.tipoPagamento}</td>
          <td class="text-center acoes-col">
            <button class="btn btn-editar btn-sm"
                    data-id="${i.id}"
                    title="Editar ingresso">✏️</button>
            <button class="btn btn-excluir btn-sm"
                    data-id="${i.id}"
                    data-label="${i.nomeCliente.replace(/"/g, '&quot;')}"
                    title="Excluir ingresso">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
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

  // ── Inicialização ────────────────────────────────────────

  carregarSessoes();
  verificarDependencias();
  renderizarIngressos();

});
