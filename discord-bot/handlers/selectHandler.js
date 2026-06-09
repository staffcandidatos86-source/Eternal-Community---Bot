const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
} = require('discord.js');
const menuManager = require('../utils/menuManager');
const {
    handleVerMenuSelecionado,
    handleVerItemSelecionado,
    handleEditorMenuSelecionado,
    handleConfirmDeletar,
    voltarPainelRow,
    voltarEditorRow,
    errEmbed,
} = require('./painelHandler');

async function handleSelect(interaction) {
    const id = interaction.customId;
    const value = interaction.values[0];

    if (id === 'ver_select_menu') return handleVerMenuSelecionado(interaction, parseInt(value));

    if (id.startsWith('ver_select_item:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleVerItemSelecionado(interaction, menuIndex, parseInt(value));
    }

    if (id === 'editar_select_menu') return handleEditorMenuSelecionado(interaction, parseInt(value));

    if (id.startsWith('editor_confirm_rem_item:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleRemoverItem(interaction, menuIndex, parseInt(value));
    }

    if (id.startsWith('editor_select_edit_item:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handleAbrirModalEditarItem(interaction, menuIndex, parseInt(value));
    }

    if (id.startsWith('preview_select_item:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handlePreviewItem(interaction, menuIndex, parseInt(value));
    }

    if (id === 'canal_select') {
        menuManager.setCanal(value);
        return interaction.update({
            embeds: [new EmbedBuilder()
                .setTitle('✅ Canal configurado!')
                .setDescription(`O canal <#${value}> foi definido como canal de envio.`)
                .setColor(0x57F287)],
            components: [voltarPainelRow()],
        });
    }

    if (id === 'enviar_select_menu') return handleEnviarMenuAoCanal(interaction, parseInt(value));

    if (id === 'deletar_select_menu') return handleConfirmDeletar(interaction, parseInt(value));

    if (id.startsWith('publico_select_item:')) {
        const menuIndex = parseInt(id.split(':')[1]);
        return handlePublicoItem(interaction, menuIndex, parseInt(value));
    }
}

async function handleRemoverItem(interaction, menuIndex, itemIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu) return interaction.update({ embeds: [errEmbed('Menu não encontrado.')], components: [voltarEditorRow(menuIndex)] });
    const nomeItem = menu.items[itemIndex]?.titulo || 'Item';
    menuManager.removerItem(menuIndex, itemIndex);
    const { buildEditorMenu } = require('./painelHandler');
    const result = buildEditorMenu(menuIndex);
    return interaction.update({
        embeds: [
            new EmbedBuilder().setDescription(`✅ Item **${nomeItem}** removido com sucesso!`).setColor(0x57F287),
            result.embed,
        ],
        components: result.components,
    });
}

async function handleAbrirModalEditarItem(interaction, menuIndex, itemIndex) {
    const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
    const menu = menuManager.getMenu(menuIndex);
    if (!menu || !menu.items[itemIndex]) return;
    const item = menu.items[itemIndex];

    const modal = new ModalBuilder()
        .setCustomId(`modal_edit_item:${menuIndex}:${itemIndex}`)
        .setTitle('📝 Editar Item')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('item_titulo')
                    .setLabel('Título')
                    .setStyle(TextInputStyle.Short)
                    .setValue(item.titulo)
                    .setRequired(true)
                    .setMaxLength(50),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('item_emoji')
                    .setLabel('Emoji (opcional)')
                    .setStyle(TextInputStyle.Short)
                    .setValue(item.emoji || '')
                    .setRequired(false)
                    .setMaxLength(10),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('item_codigo')
                    .setLabel('Código')
                    .setStyle(TextInputStyle.Paragraph)
                    .setValue(item.codigo.slice(0, 4000))
                    .setRequired(true),
            ),
        );
    return interaction.showModal(modal);
}

async function handlePreviewItem(interaction, menuIndex, itemIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu || !menu.items[itemIndex]) return interaction.update({ embeds: [errEmbed('Item não encontrado.')], components: [voltarEditorRow(menuIndex)] });
    const item = menu.items[itemIndex];

    const embed = new EmbedBuilder()
        .setTitle(`${item.emoji || '📄'} ${item.titulo}`)
        .setDescription(`\`\`\`${menu.linguagem}\n${item.codigo}\n\`\`\``)
        .setColor(0x5865F2)
        .setFooter({ text: `${menu.nome} | Preview` });

    return interaction.update({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`editor_preview:${menuIndex}`).setLabel('Voltar ao Preview').setEmoji('🔙').setStyle(ButtonStyle.Secondary),
        )],
    });
}

async function handleEnviarMenuAoCanal(interaction, menuIndex) {
    const menu = menuManager.getMenu(menuIndex);
    const canalId = menuManager.getCanal();

    if (!menu) return interaction.update({ embeds: [errEmbed('Menu não encontrado.')], components: [voltarPainelRow()] });
    if (!canalId) return interaction.update({ embeds: [errEmbed('Nenhum canal configurado.')], components: [voltarPainelRow()] });
    if (menu.items.length === 0) return interaction.update({ embeds: [errEmbed('O menu não tem itens.')], components: [voltarPainelRow()] });

    const canal = interaction.guild.channels.cache.get(canalId);
    if (!canal) return interaction.update({ embeds: [errEmbed('Canal não encontrado no servidor.')], components: [voltarPainelRow()] });

    const select = new StringSelectMenuBuilder()
        .setCustomId(`publico_select_item:${menuIndex}`)
        .setPlaceholder(`Selecione um código de ${menu.nome}...`)
        .addOptions(menu.items.map((item, i) => ({
            label: item.titulo,
            value: String(i),
            emoji: item.emoji || '📄',
        })));

    const embed = new EmbedBuilder()
        .setTitle(`📚 ${menu.nome}`)
        .setDescription(menu.descricao || 'Selecione um código abaixo.')
        .setColor(0x5865F2)
        .setFooter({ text: 'Selecione um item para ver o código' });

    await canal.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(select)],
    });

    return interaction.update({
        embeds: [new EmbedBuilder()
            .setTitle('✅ Menu enviado!')
            .setDescription(`O menu **${menu.nome}** foi enviado para <#${canalId}>.`)
            .setColor(0x57F287)],
        components: [voltarPainelRow()],
    });
}

async function handlePublicoItem(interaction, menuIndex, itemIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu || !menu.items[itemIndex]) {
        return interaction.reply({ content: '❌ Item não encontrado.', ephemeral: true });
    }
    const item = menu.items[itemIndex];

    const embed = new EmbedBuilder()
        .setTitle(`${item.emoji || '📄'} ${item.titulo}`)
        .setDescription(`\`\`\`${menu.linguagem}\n${item.codigo}\n\`\`\``)
        .setColor(0x5865F2)
        .setFooter({ text: menu.nome });

    const voltarRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltar_menu_publico:${menuIndex}`)
            .setLabel('Voltar ao Menu')
            .setEmoji('🔙')
            .setStyle(ButtonStyle.Secondary),
    );

    return interaction.reply({ embeds: [embed], components: [voltarRow], ephemeral: true });
}

module.exports = { handleSelect };
