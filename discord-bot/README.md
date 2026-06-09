# 🤖 Bot Discord — Sistema de Entrega de Códigos

Bot Discord completo com sistema de menus dropdown para entrega de códigos de programação.

## ⚡ Configuração Rápida

### 1. Configure o `config.json`

```json
{
  "token": "SEU_TOKEN_AQUI",
  "clientId": "SEU_CLIENT_ID_AQUI",
  "guildId": "SEU_GUILD_ID_AQUI"
}
```

**Como obter cada valor:**

| Campo | Como obter |
|---|---|
| `token` | [Discord Developer Portal](https://discord.com/developers/applications) → seu app → **Bot** → **Reset Token** |
| `clientId` | Developer Portal → seu app → **General Information** → **Application ID** |
| `guildId` | Discord → clique direito no servidor → **Copiar ID do servidor** (ative Modo Desenvolvedor em Configurações) |

### 2. Instale as dependências

```bash
cd discord-bot
npm install
```

### 3. Registre os comandos slash

```bash
node deploy-commands.js
```

> Execute isso apenas uma vez (ou quando alterar comandos).

### 4. Inicie o bot

```bash
node index.js
```

---

## 🎮 Como Usar

### Comando `/painel` (apenas administradores)

Abre o painel de controle com 6 botões:

| Botão | Função |
|---|---|
| 📚 Ver Menus | Navega e testa todos os menus |
| ✏️ Editar Menu | Edita nome, linguagem, itens |
| ➕ Criar Menu | Cria um novo menu via modal |
| 📢 Canal de Envio | Define o canal onde os menus são publicados |
| 📤 Enviar Menu | Publica um menu no canal configurado |
| 🗑️ Deletar Menu | Remove um menu permanentemente |

### Fluxo para usuários comuns

1. Usuário vê o menu dropdown publicado no canal
2. Seleciona um código da lista
3. Recebe embed com o código formatado (ephemeral — só ele vê)
4. Clica "🔙 Voltar ao Menu" para escolher outro código

---

## 📁 Estrutura do Projeto

```
discord-bot/
├── index.js              # Arquivo principal, registra eventos
├── deploy-commands.js    # Registra o comando /painel
├── config.json           # Token, clientId, guildId (PRIVADO)
├── menus.json            # Dados dos menus e canal configurado
├── handlers/
│   ├── painelHandler.js  # Lógica do painel de controle (/painel)
│   ├── buttonHandler.js  # Gerencia cliques em botões
│   ├── selectHandler.js  # Gerencia seleções em dropdowns
│   └── modalHandler.js   # Gerencia submissões de modais
└── utils/
    └── menuManager.js    # CRUD do menus.json
```

---

## 🗂️ Menus Padrão Incluídos

O `menus.json` já vem com 5 menus prontos:

1. **JavaScript Básico** — Hello World, Arrow Function, Array Methods
2. **Python Iniciante** — Hello World, List Comprehension, Funções
3. **HTML & CSS** — Estrutura HTML5, Flexbox, Grid
4. **Comandos Git** — Iniciar repo, Branch, Push & Pull
5. **SQL Básico** — SELECT, INSERT, JOIN

---

## ⚠️ Permissões necessárias no Discord

O bot precisa das seguintes permissões ao ser convidado:
- `Send Messages`
- `Embed Links`
- `Read Message History`
- `Use Application Commands`

Link de convite (substitua `CLIENT_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=277025392640&scope=bot+applications.commands
```
