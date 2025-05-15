const { Permissions, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        if (!interaction.isButton()) return;

        const adminRoleId = 'ID_DA_ROLE_DE_ADMINISTRADOR'; // Substitua com o ID da role de administrador

        if (interaction.customId === 'ticket_fortnite') {
            if (!interaction.guild) return;

            // Verificar se já existe um canal de ticket para o usuário
            const existingChannel = interaction.guild.channels.cache.find(c => c.topic && c.topic.startsWith(`${interaction.user.id}|`));
            if (existingChannel) {
                return interaction.reply({ content: `**<a:X_:1279892264859992105> Você já tem um ticket aberto no servidor.**`, ephemeral: true });
            }

            // Criar o novo canal de ticket
            let ticketChannel;
            try {
                ticketChannel = await interaction.guild.channels.create(`💰・Pedido de ${interaction.user.username}`, {
                    type: 'GUILD_TEXT',
                    topic: `${interaction.user.id}|`,
                    parent: '1371986323862192169', // ID da categoria
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [Permissions.FLAGS.VIEW_CHANNEL]
                        },
                        {
                            id: interaction.user.id,
                            allow: [Permissions.FLAGS.VIEW_CHANNEL]
                        }
                    ]
                });
            } catch (error) {
                console.error('Erro ao criar o canal:', error);
                return interaction.reply({ content: '**<a:X_:1279892264859992105> Ocorreu um erro ao criar seu ticket.**', ephemeral: true });
            }

            // Criar e enviar a mensagem do ticket
            const catalogEmbed = new MessageEmbed()
                .setColor('#FFC222')
                .setTitle('<a:confete:1279896939084644462> Bem-vindo ao seu ticket!')
                .setDescription('Estamos aqui para ajudar você com a compra de V-Bucks.\nQualquer dúvida, pergunte!')
                .addFields(
                    { name: '<:cash:1209960384300187650> Valor desejado', value: 'Informe o valor que você quer.' },
                    { name: '<a:presente:1206121309390643200> Opções disponíveis', value: 'Confira as opções de V-Bucks [aqui](https://discord.com/channels/1078189323557543956/1206101578411671572).' }
                )
                .setFooter({ text: '- Estamos aqui para ajudar! ' }) //coloque o noem do seu market aqui!
                .setThumbnail('');

            const actionRow = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('assume_ticket')
                        .setLabel('Assumir Ticket')
                        .setStyle('SUCCESS')
                        .setEmoji('<a:verificado:1159554658788966450>'), // MUDE COMO QUISER 
                    new MessageButton()
                        .setCustomId('notify_user')
                        .setLabel('Notificar Usuário')
                        .setStyle('PRIMARY')
                        .setEmoji('<:aviso:1279894875931676832>')
                );

            let sentMessage;
            try {
                sentMessage = await ticketChannel.send({
                    embeds: [catalogEmbed],
                    components: [actionRow]
                });
            } catch (error) {
                console.error('Erro ao enviar mensagem para o canal:', error);
                return interaction.reply({ content: '**<a:X_:1279892264859992105> Ocorreu um erro ao enviar a mensagem para o canal.**', ephemeral: true });
            }

            // Atualizar o tópico do canal com o ID da mensagem
            ticketChannel.setTopic(`${interaction.user.id}|${sentMessage.id}`).catch(console.error);

            return interaction.reply({ content: `**<a:verificado:1159554658788966450> Seu ticket foi aberto com sucesso. <#${ticketChannel.id}>**`, ephemeral: true });
        }

        if (interaction.customId === 'assume_ticket' || interaction.customId === 'notify_user') {
            const hasPermission = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
            if (!hasPermission) {
                return interaction.reply({ content: '**<a:X_:1279892264859992105> Você não tem permissão para usar esse botão.**', ephemeral: true });
            }

            const ticketChannel = client.channels.cache.get(interaction.channelId);
            if (!ticketChannel) {
                return interaction.reply({ content: '**<a:X_:1279892264859992105> Não foi possível encontrar o ticket.**', ephemeral: true });
            }

            const [ticketOwnerId] = ticketChannel.topic.split('|');
            let ticketOwner;

            try {
                ticketOwner = await client.users.fetch(ticketOwnerId);
            } catch (error) {
                console.error('Erro ao buscar o dono do ticket:', error);
                return interaction.reply({ content: '**<a:X_:1279892264859992105> Não foi possível encontrar o dono do ticket.**', ephemeral: true });
            }

            if (interaction.customId === 'assume_ticket') {
                try {
                    await ticketOwner.send({
                        embeds: [new MessageEmbed()
                            .setTitle(' Olá! Temos boas notícias!')
                            .setDescription(`👥 Seu ticket foi assumido pelo **${interaction.member.displayName}**. Estamos prontos para responder suas dúvidas ou te ajudar a concluir sua compra. Por favor, fique à vontade para compartilhar os detalhes. 😊\n\nAcompanhe o seu ticket em: <#${ticketChannel.id}>`)
                            .setColor('#FFC222')
                            .setFooter({ text: '© Snow Emporium - Todos os direitos reservados' })
                        ]
                    });
                } catch (error) {
                    if (error.code === 50007) {
                        await ticketChannel.send(':x: Não foi possível enviar uma mensagem privada para o usuário.');
                    } else {
                        console.error('**<a:X_:1279892264859992105> Erro ao enviar mensagem para o usuário:**', error);
                    }
                }

                await interaction.reply({ content: `**<a:verificado:1159554658788966450> Ticket assumido com sucesso.**` });

                const updatedActionRow = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('assume_ticket')
                            .setLabel('Ticket Assumido')
                            .setStyle('SECONDARY')
                            .setEmoji('<:barra:1279895294678532136>')
                            .setDisabled(true),
                        new MessageButton()
                            .setCustomId('notify_user')
                            .setLabel('Notificar Usuário')
                            .setStyle('PRIMARY')
                            .setEmoji('<:aviso:1279894875931676832>')
                    );

                const messageId = ticketChannel.topic.split('|')[1];
                let botMessage;

                try {
                    botMessage = await ticketChannel.messages.fetch(messageId);
                } catch (error) {
                    console.error('Erro ao buscar a mensagem do bot:', error);
                    await ticketChannel.send(':x: Não foi possível encontrar a mensagem do bot para edição.');
                    return;
                }

                if (botMessage && typeof botMessage.edit === 'function') {
                    try {
                        await botMessage.edit({ components: [updatedActionRow] });
                    } catch (error) {
                        console.error('Erro ao editar a mensagem do bot:', error);
                    }
                } else {
                    console.error('A mensagem do bot não pode ser editada ou não foi encontrada.');
                }
            }

            if (interaction.customId === 'notify_user') {
                try {
                    await ticketOwner.send({
                        embeds: [new MessageEmbed()
                            .setTitle('📢 Olá! Nova notificação,')
                            .setDescription(`🔔 Seu ticket recebeu uma resposta. 😄\n\nAcompanhe em: <#${ticketChannel.id}>`)
                            .setColor('#FFC222')
                            .setFooter({ text: '© Snow Emporium - Todos os direitos reservados' })
                        ]
                    });
                } catch (error) {
                    if (error.code === 50007) {
                        await ticketChannel.send(':x: Não foi possível enviar uma mensagem privada para o usuário.');
                    } else {
                        console.error('**Erro ao enviar notificação para o usuário:**', error);
                    }
                }

                await interaction.reply({ content: `**<a:verificado:1159554658788966450> Notificação enviada com sucesso.**` });
            }
        }
    }
};
