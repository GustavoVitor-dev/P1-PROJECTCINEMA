/**
 * programacao.js — Listagem de sessões disponíveis (programação)
 *
 * Cruza sessões + filmes + salas e renderiza cards
 * com botão de redirecionamento para compra de ingresso.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderizarSessoes();
});

function renderizarSessoes() {
  const sessoes   = Storage.get('sessoes');
  const filmes    = Storage.get('filmes');
  const salas     = Storage.get('salas');
  const container = document.getElementById('sessoes-container');

  // Estado vazio: orienta o usuário
  if (sessoes.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center empty-state">
        <p class="fs-5 mb-3">Nenhuma sessão disponível no momento.</p>
        <a href="cadastro-sessoes.html" class="btn btn-cinema">Cadastrar Sessão</a>
      </div>`;
    return;
  }

  // Para cada sessão, busca o filme e a sala relacionados
  container.innerHTML = sessoes.map(s => {
    const filme = filmes.find(f => f.id === s.filmeId);
    const sala  = salas.find(sl => sl.id === s.salaId);

    const [data, hora] = s.dataHora.split('T');
    const [ano, mes, dia] = data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano} às ${hora}`;

    // O link para compra passa o ID da sessão via query string
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card session-card h-100">
          <div class="card-body d-flex flex-column">

            <h5 class="card-title fw-bold mb-0">
              ${filme ? filme.titulo : 'Filme indisponível'}
            </h5>
            <p class="text-muted mb-2" style="font-size:0.85rem;">
              ${filme?.genero || ''} · ${filme?.classificacao || ''}
              ${filme ? `· ${filme.duracao} min` : ''}
            </p>

            <hr class="my-2">

            <p class="mb-1">🏛️ <strong>Sala:</strong> ${sala ? sala.nome : '—'} (${sala?.tipo || ''})</p>
            <p class="mb-1">🕐 <strong>Horário:</strong> ${dataFormatada}</p>
            <p class="mb-1">🎬 <strong>Sessão:</strong> ${s.idioma} · ${s.formato}</p>
            <p class="mb-3">💰 <strong>Preço:</strong> R$ ${s.preco.toFixed(2)}</p>

            <a href="venda-ingressos.html?sessao=${s.id}"
               class="btn btn-cinema mt-auto w-100">
              Comprar Ingresso
            </a>

          </div>
        </div>
      </div>
    `;
  }).join('');
}
