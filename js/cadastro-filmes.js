/**
 * cadastro-filmes.js — Cadastro e listagem de filmes
 *
 * Captura o formulário, monta o objeto filme,
 * salva no localStorage e atualiza a tabela na mesma página.
 */

document.addEventListener('DOMContentLoaded', () => {

  const form     = document.getElementById('form-filme');
  const feedback = document.getElementById('feedback');

  // Ao submeter: lê os campos, salva e atualiza a listagem
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const filme = {
      titulo:        document.getElementById('titulo').value.trim(),
      genero:        document.getElementById('genero').value,
      descricao:     document.getElementById('descricao').value.trim(),
      classificacao: document.getElementById('classificacao').value,
      duracao:       parseInt(document.getElementById('duracao').value),
      estreia:       document.getElementById('estreia').value
    };

    Storage.add('filmes', filme);
    exibirFeedback('Filme salvo com sucesso!', 'success');
    form.reset();
    renderizarFilmes();
  });

  // Monta a tabela com todos os filmes já no localStorage
  function renderizarFilmes() {
    const lista = Storage.get('filmes');
    const tbody = document.getElementById('lista-filmes');

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-3">
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
      </tr>
    `).join('');
  }

  // Converte "AAAA-MM-DD" para "DD/MM/AAAA"
  function formatarData(dataISO) {
    if (!dataISO) return '—';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  // Exibe alerta temporário que some após 3s
  function exibirFeedback(msg, tipo) {
    feedback.textContent = msg;
    feedback.className = `alert alert-${tipo} feedback-alert`;
    feedback.style.display = 'block';
    setTimeout(() => (feedback.style.display = 'none'), 3000);
  }

  renderizarFilmes();

});
