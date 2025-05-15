const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'd',
    usage: 'template',
    category: 'mod',  // COLOQUE A CATEGORIA CORRETA DO CARGO..
    description: 'EMPTY', //FEITO PARA TIRAR ALGUMA DUVIDA, DUVIAS COMUNS!! 
    async execute(client, message, args) {
        try {
            // Crie o embed
            const howItWorksEmbed = new MessageEmbed()
                .setTitle('Como funciona as skins enviadas por presente:')
                .setDescription(' ')
                .addFields(
                    {
                        name: '',
                        value: '', //AQUI VC PODE COLOCAR SEU TEXTO, PARA TIRAR UMA DUVIDA CONSTANTE
                    },
                )
                .setColor('#000000'); // Defina a cor que vc desejar


            await message.channel.send({ embeds: [howItWorksEmbed] });
        } catch (error) {
            console.error('Erro ao enviar as instruções:', error);
            message.reply('Ocorreu um erro ao enviar as instruções.');
        }
    },
};