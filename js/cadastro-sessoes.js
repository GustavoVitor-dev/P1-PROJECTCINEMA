/**
 * cadastro-sessoes.js — Cadastro de sessões
 *
 * Os selects de Filme e Sala são populados dinamicamente
 * lendo o localStorage — encadeamento de dados entre entidades.
 */

document.addEventListener('DOMContentLoaded', () => {

  const form        = document.getElementById('form-sessao');
  const feedback    = document.getElementById('feedback');
  const selectFilme = document.getElementById('filme');
  const selectSala  = document.getElementById('sala');

  // Preenche o <select> de filmes com o que está salvo
  function carregarFilmes() {
    const filmes = Storage.get('filmes');
    selectFilme.innerHTML = '<option value="">Selecione um filme</option>';

    if (filmes.length === 0) {
      selectFilme.innerHTML += '<option disabled>— Nenhum filme cadastrado —</option>';
      return;
    }

    filmes.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.titulo} (${f.classificacao})`;
      selectFilme.appendChild(opt);
    });
  }

  // Preenche o <select> de salas com o que está salvo
  function carregarSalas() {
    const salas = Storage.get('salas');
    selectSala.innerHTML = '<option value="">Selecione uma sala</option>';

    if (salas.length === 0) {
      selectSala.innerHTML += '<option disabled>— Nenhuma sala cadastrada —</option>';
      return;
    }

    salas.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.nome} · ${s.tipo} · ${s.capacidade} lugares`;
      selectSala.appendChild(opt);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const sessao = {
      filmeId:  Number(selectFilme.value),
      salaId:   Number(selectSala.value),
      dataHora: document.getElementById('dataHora').value,
      preco:    parseFloat(document.getElementById('preco').value),
      idioma:   document.getElementById('idioma').value,
      formato:  document.getElementById('formato').value
    };

    Storage.add('sessoes', sessao);
    exibirFeedback('Sessão cadastrada com sucesso!', 'success');
    form.reset();
    carregarFilmes();
    carregarSalas();
    renderizarSessoes();
  });

  // Cruza sessões com filmes e salas para exibir nomes legíveis
  function renderizarSessoes() {
    const sessoes = Storage.get('sessoes');
    const filmes  = Storage.get('filmes');
    const salas   = Storage.get('salas');
    const tbody   = document.getElementById('lista-sessoes');

    if (sessoes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-3">
            Nenhuma sessão cadastrada ainda.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = sessoes.map(s => {
      const filme = filmes.find(f => f.id === s.filmeId);
      const sala  = salas.find(sl => sl.id === s.salaId);

      return `
        <tr>
          <td class="fw-semibold">${filme ? filme.titulo : '—'}</td>
          <td>${sala ? sala.nome : '—'}</td>
          <td>${formatarDataHora(s.dataHora)}</td>
          <td>R$ ${s.preco.toFixed(2)}</td>
          <td>${s.idioma} / ${s.formato}</td>
        </tr>
      `;
    }).join('');
  }

  // "2025-06-15T20:30" → "15/06/2025 20:30"
  function formatarDataHora(dt) {
    if (!dt) return '—';
    const [data, hora] = dt.split('T');
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano} ${hora}`;
  }

  function exibirFeedback(msg, tipo) {
    feedback.textContent = msg;
    feedback.className = `alert alert-${tipo} feedback-alert`;
    feedback.style.display = 'block';
    setTimeout(() => (feedback.style.display = 'none'), 3000);
  }

  carregarFilmes();
  carregarSalas();
  renderizarSessoes();

});
