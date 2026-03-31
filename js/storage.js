/**
 * storage.js — Helper centralizado para o localStorage
 *
 * Todos os outros arquivos JS dependem deste.
 * Ele deve ser o primeiro script carregado nas páginas.
 */

const Storage = {

  // Lê uma lista do localStorage (retorna array vazio se não existir)
  get(chave) {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : [];
  },

  // Salva uma lista completa no localStorage
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

  // Adiciona um item à lista, gerando um ID único via timestamp
  add(chave, item) {
    const lista = this.get(chave);
    item.id = Date.now();
    lista.push(item);
    return this.save(chave, lista);
  },

  // Busca um item pelo ID dentro de uma lista
  findById(chave, id) {
    return this.get(chave).find(item => item.id === Number(id)) || null;
  }

};
