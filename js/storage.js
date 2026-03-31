/**
 * storage.js — Helper centralizado para o localStorage
 *
 * Todos os outros arquivos JS dependem deste.
 * Ele deve ser o primeiro script carregado nas páginas.
 *
 * Hierarquia de dependências:
 *   filmes ──┐
 *             ├──► sessoes ──► ingressos
 *   salas  ──┘
 */

const Storage = {

  // ─── Leitura ─────────────────────────────────────────────

  /** Retorna todos os itens de uma coleção */
  get(chave) {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : [];
  },

  /** Busca um item pelo ID dentro de uma coleção */
  findById(chave, id) {
    return this.get(chave).find(item => item.id === Number(id)) || null;
  },

  // ─── Escrita ─────────────────────────────────────────────

  /** Salva a lista completa de volta no localStorage */
  save(chave, lista) {
    try {
      localStorage.setItem(chave, JSON.stringify(lista));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('Espaço de armazenamento do navegador esgotado!');
      }
      return false;
    }
  },

  /** Adiciona um item (gera ID via timestamp) e salva */
  add(chave, item) {
    const lista = this.get(chave);
    item.id = Date.now();
    lista.push(item);
    return this.save(chave, lista);
  },

  /**
   * Atualiza um item existente mantendo o ID original.
   * Os dados dependentes (sessões, ingressos) não precisam ser alterados
   * pois referenciam por ID — a nova informação reflete automaticamente
   * ao renderizar (join por ID).
   *
   * @param {string} chave - coleção ('filmes' | 'salas' | 'sessoes' | 'ingressos')
   * @param {number} id    - ID do registro a atualizar
   * @param {object} dados - campos a sobrescrever (id será preservado)
   * @returns {boolean} true se encontrou e atualizou
   */
  update(chave, id, dados) {
    id = Number(id);
    const lista = this.get(chave);
    const idx   = lista.findIndex(item => item.id === id);
    if (idx === -1) return false;

    // Mescla os dados novos, garantindo que o id original seja preservado
    lista[idx] = { ...lista[idx], ...dados, id };
    return this.save(chave, lista);
  },

  // ─── Remoção com cascata ──────────────────────────────────

  /**
   * Remove um item de uma coleção e, dependendo da entidade,
   * remove em cascata todos os registros dependentes.
   *
   * Regras de cascata:
   *  • filme   → remove sessões cujo filmeId === id
   *               → para cada sessão removida, remove ingressos cujo sessaoId === sessao.id
   *  • sala    → remove sessões cujo salaId  === id
   *               → para cada sessão removida, remove ingressos cujo sessaoId === sessao.id
   *  • sessao  → remove ingressos cujo sessaoId === id
   *  • ingresso → remove apenas o próprio ingresso
   *
   * @param {string} chave  - 'filmes' | 'salas' | 'sessoes' | 'ingressos'
   * @param {number} id     - ID do registro a remover
   * @returns {{ removido: boolean, cascata: { sessoes: number, ingressos: number } }}
   */
  remove(chave, id) {
    id = Number(id);
    const resultado = { removido: false, cascata: { sessoes: 0, ingressos: 0 } };

    const lista = this.get(chave);
    const idx   = lista.findIndex(item => item.id === id);
    if (idx === -1) return resultado;

    lista.splice(idx, 1);
    this.save(chave, lista);
    resultado.removido = true;

    // Cascata para sessões → ingressos
    if (chave === 'filmes' || chave === 'salas') {
      const campo = chave === 'filmes' ? 'filmeId' : 'salaId';
      const todasSessoes = this.get('sessoes');
      const sessoesRemover = todasSessoes.filter(s => s[campo] === id);

      sessoesRemover.forEach(s => {
        resultado.cascata.ingressos += this._removerIngressosDaSessao(s.id);
      });

      const sessoesRestantes = todasSessoes.filter(s => s[campo] !== id);
      this.save('sessoes', sessoesRestantes);
      resultado.cascata.sessoes = sessoesRemover.length;
    }

    if (chave === 'sessoes') {
      resultado.cascata.ingressos = this._removerIngressosDaSessao(id);
    }

    return resultado;
  },

  /** Remove todos os ingressos vinculados à sessão informada */
  _removerIngressosDaSessao(sessaoId) {
    sessaoId = Number(sessaoId);
    const todos     = this.get('ingressos');
    const restantes = todos.filter(i => i.sessaoId !== sessaoId);
    const qtd       = todos.length - restantes.length;
    if (qtd > 0) this.save('ingressos', restantes);
    return qtd;
  },

  // ─── Verificações de dependência ──────────────────────────

  /** true se existir ao menos 1 filme cadastrado */
  temFilmes()  { return this.get('filmes').length  > 0; },

  /** true se existir ao menos 1 sala cadastrada */
  temSalas()   { return this.get('salas').length   > 0; },

  /** true se existir ao menos 1 sessão cadastrada */
  temSessoes() { return this.get('sessoes').length > 0; },

};
