const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'pix', //altere como quiser!
    usage: 'template',
    category: 'mod', // Substitua isso pela categoria apropriada
    description: 'Comando para exibir os métodos de pagamento disponíveis.',
    async execute(client, message, args) {
        try {
            // Crie o embed
            const paymentMethodsEmbed = new MessageEmbed()
                .setTitle('Métodos de Pagamento:')
                .setDescription('Aqui estão os métodos de pagamento disponíveis:')
                .addFields(
                    { name: '', value: '' }, // name = emoji, value = texto, vai gerar os metodos de pagamentos
                    { name: '', value: '' },
                    { name: '', value: '' },
                    { name: '', value: '' },
                )
                .setColor('#000000'); // Defina a cor que você desejar

            // Envia o embed para o canal onde o comando foi executado
            await message.channel.send({ embeds: [paymentMethodsEmbed] });
        } catch (error) {
            console.error('Erro ao enviar os métodos de pagamento:', error);
            message.reply('Ocorreu um erro ao enviar os métodos de pagamento.');
        }
    },
};