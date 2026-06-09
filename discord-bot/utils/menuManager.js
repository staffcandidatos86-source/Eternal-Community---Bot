const fs = require('fs');
const path = require('path');

const MENUS_PATH = path.join(__dirname, '..', 'menus.json');

function lerDados() {
    if (!fs.existsSync(MENUS_PATH)) {
        const dadosPadrao = { menus: [], canal_id: null };
        fs.writeFileSync(MENUS_PATH, JSON.stringify(dadosPadrao, null, 2));
        return dadosPadrao;
    }
    return JSON.parse(fs.readFileSync(MENUS_PATH, 'utf-8'));
}

function salvarDados(dados) {
    fs.writeFileSync(MENUS_PATH, JSON.stringify(dados, null, 2));
}

function getMenus() {
    return lerDados().menus;
}

function getMenu(index) {
    const menus = getMenus();
    return menus[index] ?? null;
}

function getCanal() {
    return lerDados().canal_id;
}

function setCanal(canalId) {
    const dados = lerDados();
    dados.canal_id = canalId;
    salvarDados(dados);
}

function criarMenu(nome, linguagem, descricao) {
    const dados = lerDados();
    const novo = { nome, linguagem, descricao, items: [] };
    dados.menus.push(novo);
    salvarDados(dados);
    return dados.menus.length - 1;
}

function editarMenuInfo(index, nome, linguagem) {
    const dados = lerDados();
    if (!dados.menus[index]) return false;
    dados.menus[index].nome = nome;
    dados.menus[index].linguagem = linguagem;
    salvarDados(dados);
    return true;
}

function deletarMenu(index) {
    const dados = lerDados();
    if (!dados.menus[index]) return false;
    dados.menus.splice(index, 1);
    salvarDados(dados);
    return true;
}

function adicionarItem(menuIndex, titulo, codigo, emoji) {
    const dados = lerDados();
    if (!dados.menus[menuIndex]) return false;
    dados.menus[menuIndex].items.push({ titulo, codigo, emoji: emoji || '' });
    salvarDados(dados);
    return true;
}

function editarItem(menuIndex, itemIndex, titulo, codigo, emoji) {
    const dados = lerDados();
    const menu = dados.menus[menuIndex];
    if (!menu || !menu.items[itemIndex]) return false;
    menu.items[itemIndex] = { titulo, codigo, emoji: emoji || menu.items[itemIndex].emoji };
    salvarDados(dados);
    return true;
}

function removerItem(menuIndex, itemIndex) {
    const dados = lerDados();
    const menu = dados.menus[menuIndex];
    if (!menu || !menu.items[itemIndex]) return false;
    menu.items.splice(itemIndex, 1);
    salvarDados(dados);
    return true;
}

module.exports = {
    getMenus,
    getMenu,
    getCanal,
    setCanal,
    criarMenu,
    editarMenuInfo,
    deletarMenu,
    adicionarItem,
    editarItem,
    removerItem,
};
