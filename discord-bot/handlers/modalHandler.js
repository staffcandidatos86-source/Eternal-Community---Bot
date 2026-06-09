const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const menuManager = require('../utils/menuManager');
const { buildEditorMenu, mostrarPainel, voltarEditorRow, errEmbed } = require('./painelHandler');

async function handleModal(interaction) {
    const id = interaction.customId;

    if (id === 'modal_criar_menu') return handleModalCriarMenu(interaction);
    if (id === 'modal_editar_nome') return handleModalEditarNome(interaction);
    if (id.startsWith('modal_add_item:')) return handleModalAddItem(interaction, parseInt(id.split(':')[1]));
    if (id.startsWith('modal_edit_item:')) {
        const parts = id.split(':');
        return handleModalEditarItem(interaction, parseInt(parts[1]), parseInt(parts[2]));
    }
}

async function handleModalCriarMenu(interaction) {
    const nome = interaction.fields.getTextInputValue('menu_nome').trim();
    const linguagem = interaction.fields.getTextInputValue('menu_linguagem').trim().toLowerCase();
    const descricao = interaction.fields.getTextInputValue('menu_descricao').trim();

    const index = menuManager.criarMenu(nome, linguagem, descricao);

    const result = buildEditorMenu(index);
    const embed = new EmbedBuilder()
        .setTitle('✅ Menu criado com sucesso!')
        .setDescription(`**${nome}** foi criado. Agora você pode adicionar itens.`)
        .setColor(0x57F287);

    return interaction.update({
        embeds: [embed, result.embed],
        components: result.components,
    });
}

async function handleModalEditarNome(interaction) {
    const menuIndex = parseInt(interaction.fields.getTextInputValue('menu_index_hidden') || '0');
    const nome = interaction.fields.getTextInputValue('menu_nome').trim();
    const linguagem = interaction.fields.getTextInputValue('menu_linguagem').trim().toLowerCase();

    menuManager.editarMenuInfo(menuIndex, nome, linguagem);
    const result = buildEditorMenu(menuIndex);

    return interaction.update({
        embeds: [
            new EmbedBuilder().setDescription('✅ Nome e linguagem atualizados com sucesso!').setColor(0x57F287),
            result.embed,
        ],
        components: result.components,
    });
}

async function handleModalAddItem(interaction, menuIndex) {
    const titulo = interaction.fields.getTextInputValue('item_titulo').trim();
    const emoji = interaction.fields.getTextInputValue('item_emoji').trim();
    const codigo = interaction.fields.getTextInputValue('item_codigo');

    menuManager.adicionarItem(menuIndex, titulo, codigo, emoji);
    const result = buildEditorMenu(menuIndex);

    return interaction.update({
        embeds: [
            new EmbedBuilder().setDescription(`✅ Item **${titulo}** adicionado com sucesso!`).setColor(0x57F287),
            result.embed,
        ],
        components: result.components,
    });
}

async function handleModalEditarItem(interaction, menuIndex, itemIndex) {
    const titulo = interaction.fields.getTextInputValue('item_titulo').trim();
    const emoji = interaction.fields.getTextInputValue('item_emoji').trim();
    const codigo = interaction.fields.getTextInputValue('item_codigo');

    menuManager.editarItem(menuIndex, itemIndex, titulo, codigo, emoji || undefined);
    const result = buildEditorMenu(menuIndex);

    return interaction.update({
        embeds: [
            new EmbedBuilder().setDescription(`✅ Item **${titulo}** editado com sucesso!`).setColor(0x57F287),
            result.embed,
        ],
        components: result.components,
    });
}

module.exports = { handleModal };
