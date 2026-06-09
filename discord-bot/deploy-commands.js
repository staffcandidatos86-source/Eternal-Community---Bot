const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId || !guildId) {
    console.error('❌ Variáveis DISCORD_TOKEN, DISCORD_CLIENT_ID e DISCORD_GUILD_ID são obrigatórias.');
    process.exit(1);
}

const commands = [
    new SlashCommandBuilder()
        .setName('painel')
        .setDescription('Abre o painel de controle de menus de código (apenas administradores)')
        .setDefaultMemberPermissions(0x8)
        .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Registrando comandos slash...');
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('✅ Comandos registrados com sucesso!');
    } catch (error) {
        console.error(error);
    }
})();
