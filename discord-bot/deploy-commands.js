const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('painel')
        .setDescription('Abre o painel de controle de menus de código (apenas administradores)')
        .setDefaultMemberPermissions(0x8)
        .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Registrando comandos slash...');
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );
        console.log('Comandos registrados com sucesso!');
    } catch (error) {
        console.error(error);
    }
})();
