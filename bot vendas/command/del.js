const { MessageEmbed } = require('discord.js');

module.exports = {
    name: '',
    usage: 'dela [motivo]',
    category: 'mod',
    description: 'Comando para deletar o canal.',
    async execute(client, message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('**<a:X_:1279892264859992105> Você não tem permissão para executar este comando.**');
        }

        // Verifica se o motivo foi fornecido, caso contrário, define um motivo padrão
        const reason = args.join(' ') || 'Ausência.';

        try {
            const channel = message.channel;
            const permissions = channel.permissionOverwrites.cache;
            let ticketOwnerID = null;

            // Encontre o dono do ticket baseado nas permissões de visualização do canal
            permissions.forEach((overwrite, id) => {
                console.log(`ID: ${id}, Allow: ${overwrite.allow.bitfield}, Deny: ${overwrite.deny.bitfield}`);
                if (overwrite.allow.has('VIEW_CHANNEL') && !overwrite.deny.has('VIEW_CHANNEL')) {
                    ticketOwnerID = id;
                }
            });

            if (!ticketOwnerID) {
                // Se não conseguir identificar o dono, tente encontrar alguém com `VIEW_CHANNEL` apenas
                const membersWithPermission = channel.guild.members.cache.filter(member =>
                    member.permissionsIn(channel).has('VIEW_CHANNEL')
                );
                
                if (membersWithPermission.size === 1) {
                    ticketOwnerID = membersWithPermission.first().id;
                } else {
                    return message.reply('**<a:seta:1279688558797652081> Não foi possível identificar o dono do ticket.**');
                }
            }

            // Informa que o canal será deletado após 5 segundos
            await message.reply('**<a:loading:1279892957247569922> O canal será deletado em 5 segundos.**');

            // Aguarda 5 segundos antes de continuar
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Prepara o embed
            const embed = new MessageEmbed()
                .setTitle('📩 Ticket finalizado')
                .setDescription(`Seu ticket no servidor **${message.guild.name}** foi fechado.`)
                .addFields([
                    { name: 'Motivo do encerramento:', value: reason },
                    { name: 'Agradecemos pela sua paciência!', value: 'Se estiver interessado em mais V-Bucks ou possuir mais alguma dúvida, sinta-se à vontade para abrir outro ticket.' }
                ])
                .setColor('#FFC222') // Cor amarela para simbolizar o fechamento
                .setThumbnail('') // Substitua pelo ícone do servidor
                .setFooter({
                    text: 'Atenciosamente, equipe de suporte da..... ',
                    iconURL: ''
                })
                .setTimestamp();

            // Envia o embed para o dono do ticket
            try {
                const user = await client.users.fetch(ticketOwnerID);
                await user.send({ embeds: [embed] });
            } catch (error) {
                console.error('Erro ao enviar a mensagem privada para o dono do ticket:', error);
                message.reply('**<a:X_:1279892264859992105> Não foi possível enviar a mensagem privada para o dono do ticket.**');
            }

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
