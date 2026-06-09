const { Client, GatewayIntentBits, InteractionType } = require('discord.js');
const { mostrarPainel } = require('./handlers/painelHandler');
const { handleButton } = require('./handlers/buttonHandler');
const { handleSelect } = require('./handlers/selectHandler');
const { handleModal } = require('./handlers/modalHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});

client.once('ready', () => {
    console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            if (interaction.commandName === 'painel') {
                if (!interaction.memberPermissions.has('Administrator')) {
                    return interaction.reply({
                        content: '❌ Apenas administradores podem usar este comando.',
                        ephemeral: true,
                    });
                }
                return mostrarPainel(interaction, 'reply');
            }
        }

        if (interaction.isButton()) return handleButton(interaction);
        if (interaction.isStringSelectMenu()) return handleSelect(interaction);
        if (interaction.type === InteractionType.ModalSubmit) return handleModal(interaction);

    } catch (error) {
        console.error('Erro ao processar interação:', error);
        const msg = { content: '❌ Ocorreu um erro ao processar esta interação.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(msg).catch(() => {});
        } else if (interaction.isRepliable()) {
            await interaction.reply(msg).catch(() => {});
        }
    }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ Variável DISCORD_TOKEN não encontrada.');
    process.exit(1);
}

client.login(token);
