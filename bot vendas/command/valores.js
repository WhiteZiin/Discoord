const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'valores',
    usage: 'template',
    category: 'mod',  // COLOQUE A CATEGORIA CORRETA DO CARGO..
    description: 'EMPTY',//Comando para enviar o catálogo.
    async execute(client, message, args) {
        try {
            // Crie o embed
            const catalogEmbed = new MessageEmbed()
                .setTitle('Aqui está o nosso painel de preços:')
                .setDescription(' ')
                .addFields(
                    { name: '', value: '' },
                    { name: '', value: '' },
					{ name: '', value: '' },
                    { name: '', value: '' },
                    { name: '', value: '' },
                    { name: '', value: '' },
                    { name: '', value: '' },
					{ name: '', value: '' },
                    { name: '', value: '' },
					{ name: '', value: '' },
					{ name: '', value: '' },
					{ name: '', value: '' },
                    { name: '', value:'' },
					{ name: '', value:'' },
                    { name: '', value:'' },
                    { name: '', value:'' },
					{ name: '', value:'' },
                    { name: '', value: '' },
                    { name: '', value: '' },
					{ name: '', value: '' },
                    { name: '', value:'' },
					{ name: '', value:'' },
                    { name: 'Caso tenha qualquer dúvida não hesite em perguntar aqui.', value: '<a:estrela:1160721556872376350>' }
                )
                .setColor('#000000'); // Defina a cor que você desejar

            // Envia o embed (mensagem do discord) para o canal onde o comando foi executado
            await message.channel.send({ embeds: [catalogEmbed] });
        } catch (error) {
            console.error('Erro ao enviar o catálogo:', error);
            message.reply('Ocorreu um erro ao enviar o catálogo.');
        }
    },
};