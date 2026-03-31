/**
 * venda-ingressos.js — Venda de ingressos
 *
 * Popula o select de sessões combinando dados de filmes e salas.
 * Se vier com ?sessao=ID na URL (link da listagem),
 * a sessão correspondente já chega pré-selecionada.
 */

document.addEventListener('DOMContentLoaded', () => {

  const form         = document.getElementById('form-venda');
  const feedback     = document.getElementById('feedback');
  const selectSessao = document.getElementById('sessao');

  // Monta o select com todas as sessões disponíveis
  function carregarSessoes() {
    const sessoes = Storage.get('sessoes');
    const filmes  = Storage.get('filmes');
    const salas   = Storage.get('salas');

    selectSessao.innerHTML = '<option value="">Selecione uma sessão</option>';

    if (sessoes.length === 0) {
      selectSessao.innerHTML += '<option disabled>— Nenhuma sessão disponível —</option>';
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
      selectSessao.appendChild(opt);
    });

    // Pré-seleciona via query string (?sessao=ID) quando vindo da programação
    const params   = new URLSearchParams(window.location.search);
    const sessaoId = params.get('sessao');
    if (sessaoId) {
      selectSessao.value = sessaoId;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const ingresso = {
      sessaoId:      Number(selectSessao.value),
      nomeCliente:   document.getElementById('nomeCliente').value.trim(),
      cpf:           document.getElementById('cpf').value.trim(),
      assento:       document.getElementById('assento').value.trim().toUpperCase(),
      tipoPagamento: document.getElementById('tipoPagamento').value
    };

    Storage.add('ingressos', ingresso);
    exibirFeedback('Ingresso confirmado com sucesso! 🎬', 'success');
    form.reset();
    carregarSessoes();
    renderizarIngressos();
  });

  // Lista os ingressos vendidos cruzando com sessão e filme
  function renderizarIngressos() {
    const ingressos = Storage.get('ingressos');
    const sessoes   = Storage.get('sessoes');
    const filmes    = Storage.get('filmes');
    const tbody     = document.getElementById('lista-ingressos');

    if (ingressos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-3">
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
        </tr>
      `;
    }).join('');
  }

  function exibirFeedback(msg, tipo) {
    feedback.textContent = msg;
    feedback.className = `alert alert-${tipo} feedback-alert`;
    feedback.style.display = 'block';
    setTimeout(() => (feedback.style.display = 'none'), 4000);
  }

  carregarSessoes();
  renderizarIngressos();

});
