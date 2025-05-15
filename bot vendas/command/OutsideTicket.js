const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'ticket',
    usage: 'template',
    category: "mod",
    description: `EMPTY`,
    async execute(client, message, args) {
        message.delete();

        // Cria o botão para o Fortnite
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('ticket_fortnite')
                    .setLabel('') // COLOQUE SUA MENSAGEM 
                    .setEmoji('') // COLOQUE SEU EMOJI
                    .setStyle('SUCCESS') // Verde (para ser mais chamativo)
            );

        // Envia o embed com o botão
        message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle('<a:verificado:1159554658788966450> **Snow Emporium - Painel de Tickets**')
                    .setDescription(
                        '<:Crypto:1173443294441783367> **Bem-vindo ao painel de tickets da Snow Emporium!**\n\n' +
                        '**Clique no botão para abrir seu ticket e garantir a melhor experiência de compra!**'
                    )
                    .setColor('#FFC222') // Cor amarela para combinar com o tema
                    .setImage('') // Imagem 
                    .setFooter('') //Footer @blabala resevardo.. 
                    .setTimestamp() // Adiciona a data e hora
            ],
            components: [row]
        });
    }
};
