const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
} = require('discord.js');
const menuManager = require('../utils/menuManager');
const {
    mostrarPainel,
    handleVerMenus,
    handleVerMenuSelecionado,
    handleEditarMenu,
    handleEditorMenuSelecionado,
    buildEditorMenu,
    handleEditorRemItem,
    handleEditorEditItem,
    handleEditorPreview,
    handleCriarMenu,
    handleCanalConfig,
    handleEnviarMenu,
    handleDeletarMenu,
    voltarPainelRow,
    voltarEditorRow,
    errEmbed,
} = require('./painelHandler');

async function handleButton(interaction) {
    const id = interaction.customId;

    if (id === 'painel_main') return mostrarPainel(interaction, 'update');
    if (id === 'painel_ver') return handleVerMenus(interaction);
    if (id === 'painel_editar') return handleEditarMenu(interaction);
    if (id === 'painel_criar') return handleCriarMenu(interaction);
    if (id === 'painel_canal') return handleCanalConfig(interaction);
    if (id === 'painel_enviar') return handleEnviarMenu(interaction);
    if (id === 'painel_deletar') return handleDeletarMenu(interaction);

    if (id.startsWith('ver_voltar_menu:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleVerMenuSelecionado(interaction, menuIndex);
    }

    if (id.startsWith('editor_menu:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleEditorMenuSelecionado(interaction, menuIndex);
    }

    if (id.startsWith('editor_nome:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleModalEditarNome(interaction, menuIndex);
    }

    if (id.startsWith('editor_add_item:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleModalAddItem(interaction, menuIndex);
    }

    if (id.startsWith('editor_edit_item:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleEditorEditItem(interaction, menuIndex);
    }

    if (id.startsWith('editor_rem_item:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleEditorRemItem(interaction, menuIndex);
    }

    if (id.startsWith('editor_preview:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleEditorPreview(interaction, menuIndex);
    }

    if (id.startsWith('deletar_confirm:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleExecutarDeletar(interaction, menuIndex);
    }

    if (id === 'canal_atual') {
        menuManager.setCanal(interaction.channelId);
        return interaction.update({
            embeds: [new EmbedBuilder()
                .setTitle('✅ Canal configurado!')
                .setDescription(`O canal <#${interaction.channelId}> foi definido como canal de envio.`)
                .setColor(0x57F287)],
            components: [voltarPainelRow()],
        });
    }

    if (id === 'canal_remover') {
        menuManager.setCanal(null);
        return interaction.update({
            embeds: [new EmbedBuilder().setDescription('✅ Canal de envio removido com sucesso.').setColor(0x57F287)],
            components: [voltarPainelRow()],
        });
    }

    if (id.startsWith('voltar_menu_publico:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleMenuPublico(interaction, menuIndex);
    }
}

async function handleExecutarDeletar(interaction, menuIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu) return interaction.update({ embeds: [errEmbed('Menu não encontrado.')], components: [voltarPainelRow()] });
    const nome = menu.nome;
    menuManager.deletarMenu(menuIndex);
    return interaction.update({
        embeds: [new EmbedBuilder().setDescription(`✅ Menu **${nome}** deletado com sucesso!`).setColor(0x57F287)],
        components: [voltarPainelRow()],
    });
}

async function handleModalEditarNome(interaction, menuIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu) return;

    const modal = new ModalBuilder()
        .setCustomId('modal_editar_nome')
        .setTitle('✏️ Editar Nome e Linguagem')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('menu_index_hidden')
                    .setLabel('(Não edite) Índice interno')
                    .setStyle(TextInputStyle.Short)
                    .setValue(String(menuIndex))
                    .setRequired(true),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('menu_nome')
                    .setLabel('Nome do menu')
                    .setStyle(TextInputStyle.Short)
                    .setValue(menu.nome)
                    .setRequired(true)
                    .setMaxLength(50),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('menu_linguagem')
                    .setLabel('Linguagem (syntax highlight)')
                    .setStyle(TextInputStyle.Short)
                    .setValue(menu.linguagem)
                    .setRequired(true)
                    .setMaxLength(30),
            ),
        );
    return interaction.showModal(modal);
}

async function handleModalAddItem(interaction, menuIndex) {
    const modal = new ModalBuilder()
        .setCustomId(`modal_add_item:${menuIndex}`)
        .setTitle('➕ Adicionar Item')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('item_titulo')
                    .setLabel('Título do item')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(50)
                    .setPlaceholder('Ex: Hello World'),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('item_emoji')
                    .setLabel('Emoji (opcional)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
                    .setMaxLength(10)
                    .setPlaceholder('Ex: 👋'),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('item_codigo')
                    .setLabel('Código')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setPlaceholder('Cole o código aqui...'),
            ),
        );
    return interaction.showModal(modal);
}

async function handleMenuPublico(interaction, menuIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu || menu.items.length === 0) {
        return interaction.update({ content: '❌ Menu não encontrado ou sem itens.', components: [] });
    }
    const select = new StringSelectMenuBuilder()
        .setCustomId(`publico_select_item:${menuIndex}`)
        .setPlaceholder(`Selecione um código de ${menu.nome}...`)
        .addOptions(menu.items.map((item, i) => ({
            label: item.titulo,
            value: String(i),
            emoji: item.emoji || '📄',
        })));
    return interaction.update({
        embeds: [new EmbedBuilder()
            .setTitle(`📚 ${menu.nome}`)
            .setDescription(menu.descricao || 'Selecione um código abaixo.')
            .setColor(0x5865F2)],
        components: [new ActionRowBuilder().addComponents(select)],
    });
}

module.exports = { handleButton };
