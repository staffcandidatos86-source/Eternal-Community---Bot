const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
} = require('discord.js');
const menuManager = require('../utils/menuManager');

function buildPainelEmbed() {
    const menus = menuManager.getMenus();
    const canal = menuManager.getCanal();
    return new EmbedBuilder()
        .setTitle('⚙️ Painel de Controle')
        .setDescription('Gerencie os menus de códigos de programação do servidor.')
        .addFields(
            { name: '📚 Menus cadastrados', value: `${menus.length}`, inline: true },
            { name: '📢 Canal configurado', value: canal ? `<#${canal}>` : 'Não configurado', inline: true },
        )
        .setColor(0x5865F2)
        .setFooter({ text: 'Apenas administradores podem usar este painel' });
}

function buildPainelButtons() {
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('painel_ver').setLabel('Ver Menus').setEmoji('📚').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('painel_editar').setLabel('Editar Menu').setEmoji('✏️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('painel_criar').setLabel('Criar Menu').setEmoji('➕').setStyle(ButtonStyle.Success),
    );
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('painel_canal').setLabel('Canal de Envio').setEmoji('📢').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('painel_enviar').setLabel('Enviar Menu').setEmoji('📤').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('painel_deletar').setLabel('Deletar Menu').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    );
    return [row1, row2];
}

async function mostrarPainel(interaction, editOrReply = 'reply') {
    const embed = buildPainelEmbed();
    const rows = buildPainelButtons();
    const opts = { embeds: [embed], components: rows, ephemeral: true };
    if (editOrReply === 'reply') return interaction.reply(opts);
    if (editOrReply === 'update') return interaction.update(opts);
    return interaction.editReply(opts);
}

async function handleVerMenus(interaction) {
    const menus = menuManager.getMenus();
    if (menus.length === 0) {
        return interaction.update({
            embeds: [new EmbedBuilder().setDescription('❌ Nenhum menu cadastrado.').setColor(0xED4245)],
            components: [voltarPainelRow()],
        });
    }
    const select = new StringSelectMenuBuilder()
        .setCustomId('ver_select_menu')
        .setPlaceholder('Selecione um menu para visualizar...')
        .addOptions(menus.map((m, i) => ({
            label: m.nome,
            description: m.descricao?.slice(0, 100) || `Linguagem: ${m.linguagem}`,
            value: String(i),
            emoji: '📚',
        })));
    return interaction.update({
        embeds: [new EmbedBuilder().setTitle('📚 Ver Menus').setDescription('Escolha um menu para visualizar seus detalhes.').setColor(0x5865F2)],
        components: [new ActionRowBuilder().addComponents(select), voltarPainelRow()],
    });
}

async function handleVerMenuSelecionado(interaction, menuIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu) return interaction.update({ embeds: [errEmbed('Menu não encontrado.')], components: [voltarPainelRow()] });

    const embed = new EmbedBuilder()
        .setTitle(`📚 ${menu.nome}`)
        .setColor(0x5865F2)
        .addFields(
            { name: 'Linguagem', value: `\`${menu.linguagem}\``, inline: true },
            { name: 'Itens', value: `${menu.items.length}`, inline: true },
            { name: 'Descrição', value: menu.descricao || 'Sem descrição' },
        );

    if (menu.items.length === 0) {
        return interaction.update({
            embeds: [embed.addFields({ name: '⚠️', value: 'Este menu não tem itens.' })],
            components: [voltarPainelRow()],
        });
    }

    const select = new StringSelectMenuBuilder()
        .setCustomId(`ver_select_item:${menuIndex}`)
        .setPlaceholder('Selecione um item para ver o código...')
        .addOptions(menu.items.map((item, i) => ({
            label: item.titulo,
            value: String(i),
            emoji: item.emoji || '📄',
        })));

    return interaction.update({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(select), voltarPainelRow()],
    });
}

async function handleVerItemSelecionado(interaction, menuIndex, itemIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu) return interaction.update({ embeds: [errEmbed('Menu não encontrado.')], components: [voltarPainelRow()] });
    const item = menu.items[itemIndex];
    if (!item) return interaction.update({ embeds: [errEmbed('Item não encontrado.')], components: [voltarPainelRow()] });

    const embed = new EmbedBuilder()
        .setTitle(`${item.emoji || '📄'} ${item.titulo}`)
        .setDescription(`\`\`\`${menu.linguagem}\n${item.codigo}\n\`\`\``)
        .setColor(0x5865F2)
        .setFooter({ text: menu.nome });

    const voltarRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`ver_voltar_menu:${menuIndex}`)
            .setLabel('Voltar ao Menu')
            .setEmoji('🔙')
            .setStyle(ButtonStyle.Secondary),
    );

    return interaction.update({ embeds: [embed], components: [voltarRow] });
}

async function handleEditarMenu(interaction) {
    const menus = menuManager.getMenus();
    if (menus.length === 0) {
        return interaction.update({ embeds: [errEmbed('Nenhum menu para editar.')], components: [voltarPainelRow()] });
    }
    const select = new StringSelectMenuBuilder()
        .setCustomId('editar_select_menu')
        .setPlaceholder('Selecione um menu para editar...')
        .addOptions(menus.map((m, i) => ({
            label: m.nome,
            description: `${m.items.length} item(s) | ${m.linguagem}`,
            value: String(i),
            emoji: '✏️',
        })));
    return interaction.update({
        embeds: [new EmbedBuilder().setTitle('✏️ Editar Menu').setDescription('Escolha qual menu deseja editar.').setColor(0x5865F2)],
        components: [new ActionRowBuilder().addComponents(select), voltarPainelRow()],
    });
}

function buildEditorMenu(menuIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu) return null;

    const embed = new EmbedBuilder()
        .setTitle(`✏️ Editando: ${menu.nome}`)
        .setColor(0xFEE75C)
        .addFields(
            { name: 'Nome', value: menu.nome, inline: true },
            { name: 'Linguagem', value: `\`${menu.linguagem}\``, inline: true },
            { name: 'Itens', value: `${menu.items.length}`, inline: true },
            { name: 'Descrição', value: menu.descricao || 'Sem descrição' },
        );

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`editor_nome:${menuIndex}`).setLabel('Nome/Linguagem').setEmoji('✏️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`editor_add_item:${menuIndex}`).setLabel('Adicionar Item').setEmoji('➕').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`editor_edit_item:${menuIndex}`).setLabel('Editar Item').setEmoji('📝').setStyle(ButtonStyle.Secondary),
    );
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`editor_rem_item:${menuIndex}`).setLabel('Remover Item').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`editor_preview:${menuIndex}`).setLabel('Preview').setEmoji('👁️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('painel_main').setLabel('Voltar').setEmoji('🔙').setStyle(ButtonStyle.Secondary),
    );

    return { embed, components: [row1, row2] };
}

async function handleEditorMenuSelecionado(interaction, menuIndex) {
    const result = buildEditorMenu(menuIndex);
    if (!result) return interaction.update({ embeds: [errEmbed('Menu não encontrado.')], components: [voltarPainelRow()] });
    return interaction.update({ embeds: [result.embed], components: result.components });
}

async function handleEditorRemItem(interaction, menuIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu || menu.items.length === 0) {
        return interaction.update({ embeds: [errEmbed('Nenhum item para remover.')], components: [voltarEditorRow(menuIndex)] });
    }
    const select = new StringSelectMenuBuilder()
        .setCustomId(`editor_confirm_rem_item:${menuIndex}`)
        .setPlaceholder('Selecione o item a remover...')
        .addOptions(menu.items.map((item, i) => ({
            label: item.titulo,
            value: String(i),
            emoji: item.emoji || '🗑️',
        })));
    return interaction.update({
        embeds: [new EmbedBuilder().setTitle('🗑️ Remover Item').setDescription(`Selecione o item para remover do menu **${menu.nome}**.`).setColor(0xED4245)],
        components: [new ActionRowBuilder().addComponents(select), voltarEditorRow(menuIndex)],
    });
}

async function handleEditorEditItem(interaction, menuIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu || menu.items.length === 0) {
        return interaction.update({ embeds: [errEmbed('Nenhum item para editar.')], components: [voltarEditorRow(menuIndex)] });
    }
    const select = new StringSelectMenuBuilder()
        .setCustomId(`editor_select_edit_item:${menuIndex}`)
        .setPlaceholder('Selecione o item para editar...')
        .addOptions(menu.items.map((item, i) => ({
            label: item.titulo,
            value: String(i),
            emoji: item.emoji || '📝',
        })));
    return interaction.update({
        embeds: [new EmbedBuilder().setTitle('📝 Editar Item').setDescription(`Selecione o item para editar no menu **${menu.nome}**.`).setColor(0x5865F2)],
        components: [new ActionRowBuilder().addComponents(select), voltarEditorRow(menuIndex)],
    });
}

async function handleEditorPreview(interaction, menuIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu) return interaction.update({ embeds: [errEmbed('Menu não encontrado.')], components: [voltarEditorRow(menuIndex)] });

    const embed = new EmbedBuilder()
        .setTitle(`Preview: ${menu.nome}`)
        .setDescription(menu.descricao || 'Sem descrição')
        .setColor(0x5865F2)
        .setFooter({ text: '👁️ Assim os usuários verão este menu' });

    if (menu.items.length === 0) {
        return interaction.update({ embeds: [embed.addFields({ name: '⚠️', value: 'Sem itens.' })], components: [voltarEditorRow(menuIndex)] });
    }

    const select = new StringSelectMenuBuilder()
        .setCustomId(`preview_select_item:${menuIndex}`)
        .setPlaceholder(`Selecione um código de ${menu.nome}...`)
        .addOptions(menu.items.map((item, i) => ({
            label: item.titulo,
            value: String(i),
            emoji: item.emoji || '📄',
        })));

    return interaction.update({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(select), voltarEditorRow(menuIndex)],
    });
}

async function handleCriarMenu(interaction) {
    const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
    const modal = new ModalBuilder()
        .setCustomId('modal_criar_menu')
        .setTitle('➕ Criar Novo Menu')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('menu_nome').setLabel('Nome do menu').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50).setPlaceholder('Ex: Python Avançado'),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('menu_linguagem').setLabel('Linguagem (para syntax highlight)').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(30).setPlaceholder('Ex: python, javascript, html, sql, bash'),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('menu_descricao').setLabel('Descrição').setStyle(TextInputStyle.Paragraph).setRequired(false).setMaxLength(200).setPlaceholder('Breve descrição do menu...'),
            ),
        );
    return interaction.showModal(modal);
}

async function handleCanalConfig(interaction) {
    const guild = interaction.guild;
    const canais = guild.channels.cache.filter(c => c.isTextBased() && !c.isThread()).first(25);

    const options = canais.map(c => ({
        label: `#${c.name}`,
        description: c.parent?.name || 'Sem categoria',
        value: c.id,
        emoji: '💬',
    }));

    const selectCanal = new StringSelectMenuBuilder()
        .setCustomId('canal_select')
        .setPlaceholder('Selecione o canal de envio...')
        .addOptions(options);

    const rowBotoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('canal_atual').setLabel('Usar Canal Atual').setEmoji('📍').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('canal_remover').setLabel('Remover Canal').setEmoji('❌').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('painel_main').setLabel('Voltar').setEmoji('🔙').setStyle(ButtonStyle.Secondary),
    );

    const canalAtual = menuManager.getCanal();
    return interaction.update({
        embeds: [new EmbedBuilder()
            .setTitle('📢 Canal de Envio')
            .setDescription(`Canal atual: ${canalAtual ? `<#${canalAtual}>` : 'Não configurado'}\n\nEscolha o canal onde os menus serão enviados.`)
            .setColor(0x5865F2)],
        components: [new ActionRowBuilder().addComponents(selectCanal), rowBotoes],
    });
}

async function handleEnviarMenu(interaction) {
    const canal = menuManager.getCanal();
    if (!canal) {
        return interaction.update({
            embeds: [errEmbed('Nenhum canal configurado. Use **Canal de Envio** primeiro.')],
            components: [voltarPainelRow()],
        });
    }
    const menus = menuManager.getMenus();
    if (menus.length === 0) {
        return interaction.update({ embeds: [errEmbed('Nenhum menu cadastrado.')], components: [voltarPainelRow()] });
    }
    const select = new StringSelectMenuBuilder()
        .setCustomId('enviar_select_menu')
        .setPlaceholder('Selecione o menu para enviar...')
        .addOptions(menus.map((m, i) => ({
            label: m.nome,
            description: `${m.items.length} item(s) | ${m.linguagem}`,
            value: String(i),
            emoji: '📤',
        })));
    return interaction.update({
        embeds: [new EmbedBuilder().setTitle('📤 Enviar Menu').setDescription(`O menu será enviado em <#${canal}>.`).setColor(0x5865F2)],
        components: [new ActionRowBuilder().addComponents(select), voltarPainelRow()],
    });
}

async function handleDeletarMenu(interaction) {
    const menus = menuManager.getMenus();
    if (menus.length === 0) {
        return interaction.update({ embeds: [errEmbed('Nenhum menu para deletar.')], components: [voltarPainelRow()] });
    }
    const select = new StringSelectMenuBuilder()
        .setCustomId('deletar_select_menu')
        .setPlaceholder('Selecione o menu para deletar...')
        .addOptions(menus.map((m, i) => ({
            label: m.nome,
            description: `${m.items.length} item(s)`,
            value: String(i),
            emoji: '🗑️',
        })));
    return interaction.update({
        embeds: [new EmbedBuilder().setTitle('🗑️ Deletar Menu').setDescription('⚠️ Esta ação é irreversível. Escolha o menu a deletar.').setColor(0xED4245)],
        components: [new ActionRowBuilder().addComponents(select), voltarPainelRow()],
    });
}

async function handleConfirmDeletar(interaction, menuIndex) {
    const menu = menuManager.getMenu(menuIndex);
    if (!menu) return interaction.update({ embeds: [errEmbed('Menu não encontrado.')], components: [voltarPainelRow()] });

    const rowConfirm = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`deletar_confirm:${menuIndex}`).setLabel('Sim, deletar').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('painel_main').setLabel('Cancelar').setEmoji('❌').setStyle(ButtonStyle.Secondary),
    );
    return interaction.update({
        embeds: [new EmbedBuilder()
            .setTitle('🗑️ Confirmar Exclusão')
            .setDescription(`Tem certeza que deseja deletar o menu **${menu.nome}**?\n\nIsso removerá ${menu.items.length} item(s) permanentemente.`)
            .setColor(0xED4245)],
        components: [rowConfirm],
    });
}

function voltarPainelRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('painel_main').setLabel('Voltar ao Painel').setEmoji('🔙').setStyle(ButtonStyle.Secondary),
    );
}

function voltarEditorRow(menuIndex) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`editor_menu:${menuIndex}`).setLabel('Voltar ao Editor').setEmoji('🔙').setStyle(ButtonStyle.Secondary),
    );
}

function errEmbed(msg) {
    return new EmbedBuilder().setDescription(`❌ ${msg}`).setColor(0xED4245);
}

module.exports = {
    mostrarPainel,
    handleVerMenus,
    handleVerMenuSelecionado,
    handleVerItemSelecionado,
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
    handleConfirmDeletar,
    voltarPainelRow,
    voltarEditorRow,
    errEmbed,
};
