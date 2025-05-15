const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'del',
    usage: 'template',
    category: 'mod',
    description: 'Comando para deletar o canal.',
    async execute(client, message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) { //VERIFICA O CARGO ANTES DA EXECUTAR O COMANDO...
            return message.reply('**<a:X_:1279892264859992105> Você não tem permissão para executar este comando.**');
        }

        try {
            const channel = message.channel;
            let ticketOwnerID = null;

            // Encontre o dono do ticket baseado nas permissões de visualização do canal
            const membersWithPermission = channel.guild.members.cache.filter(member => 
                member.permissionsIn(channel).has('VIEW_CHANNEL') && 
                !member.permissions.has('ADMINISTRATOR') // Exclui administradores, focando no usuário comum
            );

            if (membersWithPermission.size === 1) {
                ticketOwnerID = membersWithPermission.first().id;
            }

            if (!ticketOwnerID) {
                // Se não conseguir identificar o dono, continua com o processo de deletar o canal
                await message.reply('**<a:loading:1279892957247569922> Não foi possível identificar o dono do ticket, mas o canal será deletado em 5 segundos.**');
            } else {
                // Informa que o canal será deletado após 5 segundos
                await message.reply('**<a:loading:1279892957247569922> O canal será deletado em 5 segundos.**');

                // Prepara o embed
                const embed = new MessageEmbed()
                    .setTitle('📩 Ticket finalizado')
                    .setDescription(`Seu ticket no servidor **${message.guild.name}** foi fechado.`)
                    .addFields([
                        { name: 'Motivo do encerramento:', value: '' }, //coloque algo em 'VALUE'
                        { name: 'Agradecemos pela sua paciência!', value: '' } //novamente coloque algo em 'value'
                    ])
                    .setColor('') // coloque uma cor chamativa..
                    .setThumbnail('') // Substitua pelo ícone do servidor
                    .setFooter({
                        text: '', //coloque um texto blala atenciosamente equipe tals.. 
                        iconURL: '' //coloque algo.. 
                    })
                    .setTimestamp();

                // Tenta enviar o embed para o dono do ticket
                try {
                    const user = await client.users.fetch(ticketOwnerID);
                    await user.send({ embeds: [embed] });
                } catch (error) {
                    console.error('Erro ao enviar a mensagem privada para o dono do ticket:', error);
                    await message.reply('**<a:loading:1279892957247569922> Não foi possível enviar a mensagem privada para o dono do ticket, mas o canal será deletado.**');
                }
            }

            // Aguarda 5 segundos antes de continuar
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Deleta o canal
            try {
                await channel.delete();
                console.log(`Canal ${channel.name} deletado com sucesso.`);
            } catch (error) {
                console.error('Erro ao deletar o canal:', error);
                return message.reply('**<a:X_:1279892264859992105> Não foi possível deletar o canal.**');
            }

        } catch (error) {
            console.error('Erro ao deletar o canal:', error);
            message.reply('**<a:X_:1279892264859992105> Ocorreu um erro ao tentar deletar o canal.**');
        }
    },
};
