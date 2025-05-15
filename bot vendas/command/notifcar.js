const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'notificar',
    usage: '<@usuario> [motivo]',
    category: 'mod',
    description: 'Notifica um usuário em mensagem privada sobre uma notificação com um motivo opcional.',
    async execute(client, message, args) {
        // Verifica se o usuário tem permissão de administrador
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('**<a:X_:1279892264859992105> Você não tem permissão para usar este comando.**');
        }

        try {
            // Verifica se um usuário foi mencionado
            const user = message.mentions.users.first();
            if (!user) {
                return message.reply('**<a:sirene:1279892428207423490> Por favor, mencione um usuário para notificar.**');
            }

            // Extrai o motivo, se fornecido
            const reason = args.slice(1).join(' ') || 'Motivo não especificado.';

            // Obtém o nome de exibição do autor do comando
            const authorDisplayName = message.member.displayName;

            // Cria o embed que será enviado em DM
            const notifyEmbed = new MessageEmbed()
                .setTitle('📢 Olá! Você recebeu uma notificação.')
                .setDescription(`⚡ Você foi notificado por **${authorDisplayName}**\n\nMotivo: ${reason}\n\nChat: ${message.channel}.`) //⚡ Você foi notificado por ** altere somente isso
                .setColor('#FFC222')
                .setFooter({ text: '' }); //adicione algum texto

            // Envia a mensagem privada para o usuário
            const dmChannel = await user.createDM();
            try {
                await dmChannel.send({ embeds: [notifyEmbed] });
            } catch (dmError) {
                console.error('Erro ao enviar a notificação em DM:', dmError);
                return message.reply(`**<a:X_:1279892264859992105> Não foi possível enviar a notificação para ${user.username}. Verifique se o usuário tem DMs abertas ou se o bot está bloqueado.**`);
            }

            // Apaga a mensagem do comando
            await message.delete();

            // Envia uma mensagem de confirmação no canal onde o comando foi executado
            const confirmationMessage = await message.channel.send({
                content: `**<a:verificado:1159554658788966450> Notificação enviada para ${user.username}.**`,
            });

            // Apaga a mensagem de confirmação após 5 segundos
            setTimeout(() => confirmationMessage.delete(), 5000);

        } catch (error) {
            console.error('Erro ao executar o comando:', error);
            message.reply('**<a:X_:1279892264859992105> Ocorreu um erro ao executar o comando.**');
        }
    },
};
