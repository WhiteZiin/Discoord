const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'nick', // PODE ALTERAR PARA OQ QUISER
    usage: 'template',
    category: 'mod', // COLOQUE A CATEGORIA CORRETA DO CARGO..
    description: 'EMPTY', // FEITO PARA MONSTRAR CONTAS ONLINE OU CONTAS SEGUNDARIAS
    async execute(client, message, args) {
        try {
            // Crie o embed
            const howItWorksEmbed = new MessageEmbed()
                .setTitle('COLOQUE SUA MENSAGEM AQUI !! - PODE SUAR EMOJIS POREM COPIE O ID')
                .setDescription('ㅤ')
                .addFields(
                    {
                        name: 'EMPTY',
                        value: 'ㅤ',
                    },
                    {
                        name: 'EMPTY',
                        value: 'ㅤ',
                    },
                    {
                        name: 'EMPTY',
                        value: 'ㅤ',
                    },
				    {
                        name: 'EMPTY',
                        value: 'ㅤ',
                    }
                )
                .setColor('#000000'); // Defina a cor que você desejar

            // Envia o embed (mensagens do discord) para o canal onde o comando foi executado
            await message.channel.send({ embeds: [howItWorksEmbed] });
        } catch (error) {
            console.error('Erro ao enviar as instruções:', error);
            message.reply('Ocorreu um erro ao enviar as instruções.');
        }
    },
};