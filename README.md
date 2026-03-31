# 🎬 CineSystem — Sistema Web de Controle de Cinema

Projeto desenvolvido para a disciplina de Desenvolvimento Web, implementando um sistema completo de controle de cinema utilizando **HTML**, **Bootstrap 5** e **JavaScript puro**, com persistência de dados via **localStorage**.

---

## 📋 Funcionalidades

- Cadastro de filmes com título, gênero, classificação, duração e data de estreia
- Cadastro de salas com nome, capacidade e tipo (2D, 3D, IMAX)
- Cadastro de sessões vinculando filme e sala, com data, horário, preço e idioma
- Venda de ingressos com seleção de sessão, dados do cliente e assento
- Listagem da programação com botão de compra direta por sessão

---

## 🗂️ Estrutura de Pastas

```
cinema2/
├── css/
│   ├── bootstrap.min.css     # Bootstrap 5.3 (local)
│   └── main-styles.css       # Estilos personalizados do sistema
├── img/                      # Imagens do projeto (reservado)
├── js/
│   ├── bootstrap.bundle.min.js  # Bootstrap JS + Popper (local)
│   ├── storage.js               # Helper centralizado do localStorage
│   ├── index.js                 # Lógica da página inicial
│   ├── cadastro-filmes.js       # Lógica de cadastro de filmes
│   ├── salas.js                 # Lógica de cadastro de salas
│   ├── cadastro-sessoes.js      # Lógica de cadastro de sessões
│   ├── venda-ingressos.js       # Lógica de venda de ingressos
│   └── programacao.js           # Lógica da listagem de sessões
├── index.html                # Página inicial
├── cadastro-filmes.html
├── cadastro-salas.html
├── cadastro-sessoes.html
├── venda-ingressos.html
├── sessoes.html              # Programação / sessões disponíveis
└── package.json
```

---

## 🚀 Como Executar

Por ser um projeto de front-end puro, **não precisa de servidor**:

1. Extraia o ZIP na pasta desejada
2. Abra o arquivo `index.html` diretamente no navegador
3. Navegue pelo menu para cadastrar filmes, salas e sessões

> O Bootstrap está incluído localmente — o projeto funciona **sem internet**.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura das páginas e formulários |
| Bootstrap 5.3 | Layout responsivo e componentes visuais |
| JavaScript (ES6+) | Lógica, manipulação do DOM e dados |
| localStorage | Persistência dos dados no navegador |

---

## 💾 Estrutura de Dados (localStorage)

Todos os dados são armazenados como arrays de objetos JSON:

| Chave | Descrição |
|---|---|
| `filmes` | Lista de filmes cadastrados |
| `salas` | Lista de salas cadastradas |
| `sessoes` | Lista de sessões (referencia filmeId e salaId) |
| `ingressos` | Lista de ingressos vendidos (referencia sessaoId) |

---

## 📌 Conceitos Aplicados

- Manipulação do DOM com JavaScript puro
- Criação dinâmica de elementos `<option>` em `<select>`
- Armazenamento e leitura de arrays de objetos via `JSON.stringify` / `JSON.parse`
- Encadeamento de dados entre entidades (sessão → filme → sala)
- Passagem de parâmetros entre páginas via Query String (`?sessao=ID`)
- Boas práticas: `try/catch` no `setItem` para tratar limite de armazenamento
