/**
 * cadastro-sessoes.js — CRUD completo de sessões
 *
 * ✔ Criar   — formulário lateral (requer filme + sala)
 * ✔ Ler     — tabela renderizada a partir do localStorage
 * ✔ Editar  — modal Bootstrap pré-preenchido (selects de filme/sala recarregados)
 * ✔ Excluir — confirmação + cascata (ingressos)
 */

document.addEventListener('DOMContentLoaded', () => {

  const form        = document.getElementById('form-sessao');
  const feedback    = document.getElementById('feedback');
  const selectFilme = document.getElementById('filme');
  const selectSala  = document.getElementById('sala');
  const btnSubmit   = form.querySelector('button[type="submit"]');

  // ── Modal de edição ──────────────────────────────────────
  const modalEl    = document.getElementById('modal-editar-sessao');
  const modal      = new bootstrap.Modal(modalEl);
  const modalForm  = document.getElementById('form-editar-sessao');
  let   editandoId = null;

  // ── Carregamento dos selects (formulário principal) ──────

  function carregarFilmes(selectEl, valorSelecionado = '') {
    const filmes = Storage.get('filmes');
    selectEl.innerHTML = '<option value="">Selecione um filme</option>';

    if (filmes.length === 0) {
      selectEl.innerHTML += '<option disabled>— Nenhum filme cadastrado —</option>';
      return false;
    }

    filmes.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.titulo} (${f.classificacao})`;
      if (f.id === Number(valorSelecionado)) opt.selected = true;
      selectEl.appendChild(opt);
    });
    return true;
  }

  function carregarSalas(selectEl, valorSelecionado = '') {
    const salas = Storage.get('salas');
    selectEl.innerHTML = '<option value="">Selecione uma sala</option>';

    if (salas.length === 0) {
      selectEl.innerHTML += '<option disabled>— Nenhuma sala cadastrada —</option>';
      return false;
    }

    salas.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.nome} · ${s.tipo} · ${s.capacidade} lugares`;
      if (s.id === Number(valorSelecionado)) opt.selected = true;
      selectEl.appendChild(opt);
    });
    return true;
  }

  function verificarDependencias() {
    const temFilmes = Storage.temFilmes();
    const temSalas  = Storage.temSalas();
    const avisoEl   = document.getElementById('aviso-dependencia');

    if (!temFilmes || !temSalas) {
      const faltando = [];
      if (!temFilmes) faltando.push('<a href="cadastro-filmes.html">filme</a>');
      if (!temSalas)  faltando.push('<a href="cadastro-salas.html">sala</a>');
      avisoEl.innerHTML      = `⚠️ Cadastre ao menos um(a) ${faltando.join(' e um(a) ')} antes de criar uma sessão.`;
      avisoEl.style.display  = 'block';
      btnSubmit.disabled     = true;
    } else {
      avisoEl.style.display  = 'none';
      btnSubmit.disabled     = false;
    }
  }

  // ── Abertura do modal de edição ──────────────────────────

  document.getElementById('lista-sessoes').addEventListener('click', (e) => {
    // ── Editar ───────────────────────────────────────────────
    const btnEditar = e.target.closest('.btn-editar');
    if (btnEditar) {
      editandoId = Number(btnEditar.dataset.id);
      const s    = Storage.findById('sessoes', editandoId);
      if (!s) return;

      // Preenche selects do modal com valor atual
      carregarFilmes(modalForm.querySelector('#edit-filme'), s.filmeId);
      carregarSalas (modalForm.querySelector('#edit-sala'),  s.salaId);

      modalForm.querySelector('#edit-dataHora').value = s.dataHora;
      modalForm.querySelector('#edit-preco').value    = s.preco;
      modalForm.querySelector('#edit-idioma').value   = s.idioma;
      modalForm.querySelector('#edit-formato').value  = s.formato;

      document.getElementById('modal-feedback').style.display = 'none';
      modal.show();
      return;
    }

    // ── Excluir ──────────────────────────────────────────────
    const btnExcluir = e.target.closest('.btn-excluir');
    if (!btnExcluir) return;

    const id    = Number(btnExcluir.dataset.id);
    const label = btnExcluir.dataset.label;

    const ingressos = Storage.get('ingressos').filter(i => i.sessaoId === id);

    let msg = `Deseja excluir a sessão "${label}"?`;
    if (ingressos.length > 0) {
      msg += `\n\nAtenção: isso também excluirá ${ingressos.length} ingresso(s) vinculado(s).`;
    }

    if (!confirm(msg)) return;

    const resultado = Storage.remove('sessoes', id);
    if (resultado.removido) {
      let feedbackMsg = 'Sessão excluída.';
      if (resultado.cascata.ingressos > 0)
        feedbackMsg += ` ${resultado.cascata.ingressos} ingresso(s) também removido(s).`;
      exibirFeedback(feedbackMsg, 'warning');
      renderizarSessoes();
    }
  });

  // ── Salva edição ─────────────────────────────────────────

  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const filmeId  = modalForm.querySelector('#edit-filme').value;
    const salaId   = modalForm.querySelector('#edit-sala').value;
    const dataHora = modalForm.querySelector('#edit-dataHora').value;
    const preco    = modalForm.querySelector('#edit-preco').value;
    const idioma   = modalForm.querySelector('#edit-idioma').value;
    const formato  = modalForm.querySelector('#edit-formato').value;

    const erros = [];
    if (!filmeId)                    erros.push('Filme');
    if (!salaId)                     erros.push('Sala');
    if (!dataHora)                   erros.push('Data e Hora');
    if (!preco || Number(preco) < 0) erros.push('Preço');

    if (erros.length > 0) {
      exibirModalFeedback(`Preencha: ${erros.join(', ')}.`, 'danger');
      return;
    }

    Storage.update('sessoes', editandoId, {
      filmeId:  Number(filmeId),
      salaId:   Number(salaId),
      dataHora,
      preco:    parseFloat(preco),
      idioma,
      formato
    });

    modal.hide();
    exibirFeedback('Sessão atualizada! Os ingressos vinculados refletem as mudanças automaticamente.', 'success');
    renderizarSessoes();
  });

  // ── Cadastro (formulário principal) ──────────────────────

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const filmeId  = selectFilme.value;
    const salaId   = selectSala.value;
    const dataHora = document.getElementById('dataHora').value;
    const preco    = document.getElementById('preco').value;
    const idioma   = document.getElementById('idioma').value;
    const formato  = document.getElementById('formato').value;

    if (!Storage.temFilmes() || !Storage.temSalas()) {
      exibirFeedback('Cadastre um filme e uma sala antes de criar uma sessão.', 'danger');
      return;
    }

    const erros = [];
    if (!filmeId)                    erros.push('Filme');
    if (!salaId)                     erros.push('Sala');
    if (!dataHora)                   erros.push('Data e Hora');
    if (!preco || Number(preco) < 0) erros.push('Preço');

    if (erros.length > 0) {
      exibirFeedback(`Preencha os campos obrigatórios: ${erros.join(', ')}.`, 'danger');
      return;
    }

    Storage.add('sessoes', {
      filmeId:  Number(filmeId),
      salaId:   Number(salaId),
      dataHora,
      preco:    parseFloat(preco),
      idioma,
      formato
    });

    exibirFeedback('Sessão cadastrada com sucesso!', 'success');
    form.reset();
    carregarFilmes(selectFilme);
    carregarSalas(selectSala);
    renderizarSessoes();
  });

  // ── Renderização da tabela ───────────────────────────────

  function renderizarSessoes() {
    const sessoes = Storage.get('sessoes');
    const filmes  = Storage.get('filmes');
    const salas   = Storage.get('salas');
    const tbody   = document.getElementById('lista-sessoes');

    if (sessoes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-3">
            Nenhuma sessão cadastrada ainda.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = sessoes.map(s => {
      const filme = filmes.find(f => f.id === s.filmeId);
      const sala  = salas.find(sl => sl.id === s.salaId);
      const label = `${filme ? filme.titulo : '?'} – ${formatarDataHora(s.dataHora)}`;

      return `
        <tr>
          <td class="fw-semibold">${filme ? filme.titulo : '—'}</td>
          <td>${sala ? sala.nome : '—'}</td>
          <td>${formatarDataHora(s.dataHora)}</td>
          <td>R$ ${s.preco.toFixed(2)}</td>
          <td>${s.idioma} / ${s.formato}</td>
          <td class="text-center acoes-col">
            <button class="btn btn-editar btn-sm"
                    data-id="${s.id}"
                    title="Editar sessão">✏️</button>
            <button class="btn btn-excluir btn-sm"
                    data-id="${s.id}"
                    data-label="${label.replace(/"/g, '&quot;')}"
                    title="Excluir sessão">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ── Utilitários ─────────────────────────────────────────

  function formatarDataHora(dt) {
    if (!dt) return '—';
    const [data, hora] = dt.split('T');
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano} ${hora}`;
  }

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

  carregarFilmes(selectFilme);
  carregarSalas(selectSala);
  verificarDependencias();
  renderizarSessoes();

});
