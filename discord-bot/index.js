const { Client, GatewayIntentBits, InteractionType } = require('discord.js');
const { mostrarPainel } = require('./handlers/painelHandler');
const { handleButton } = require('./handlers/buttonHandler');
const { handleSelect } = require('./handlers/selectHandler');
const { handleModal } = require('./handlers/modalHandler');

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ Variável DISCORD_TOKEN não encontrada.');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});

client.once('ready', () => {
    console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on('warn', (msg) => {
    console.warn(`⚠️ Aviso: ${msg}`);
});

client.on('error', (error) => {
    console.error('❌ Erro no cliente Discord:', error.message);
});

client.on('shardDisconnect', (event, shardId) => {
    console.warn(`🔌 Desconectado (shard ${shardId}) — código: ${event.code}. Aguardando reconexão...`);
});

client.on('shardReconnecting', (shardId) => {
    console.log(`🔄 Reconectando shard ${shardId}...`);
});

client.on('shardResume', (shardId, replayedEvents) => {
    console.log(`✅ Shard ${shardId} reconectado (${replayedEvents} eventos retomados).`);
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

process.on('unhandledRejection', (error) => {
    console.error('❌ Promise não tratada:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não capturada:', error.message);
});

function iniciar() {
    client.login(token).catch((error) => {
        console.error('❌ Falha ao conectar:', error.message);
        console.log('🔄 Tentando novamente em 10 segundos...');
        setTimeout(iniciar, 10_000);
    });
}

iniciar();
