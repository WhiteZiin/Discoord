const Discord = require("discord.js");
const { JsonDatabase } = require("wio.db");
var mercadopago = require("mercadopago");
const axios = require('axios');
const dbcv = new JsonDatabase({ databasePath: "./databases/myJsonBotConfig.json" });
const config = new JsonDatabase({ databasePath: "./config.json" });

module.exports = {
  name: "gerarpix",
  run: async (client, message, args, send, interaction) => {
    try {
      const authorId = message.author.id;

        // Pergunta diretamente ao usuário o valor do Pix
        const valorPixMessage = await message.channel.send(` Qual o valor do Pix que você quer gerar?**`); //altere se quisier
        const responseFilter = (m) => m.author.id === authorId;
        const response = await message.channel.awaitMessages({ filter: responseFilter, max: 1, time: 30000, errors: ['time'] });
	// Apaga a mensagem do usuário que usou o comando (.gerarpix)
	message.delete().catch(console.error);

      // Obtém o valor do Pix e limpa as mensagens
      const valorPix = response.first().content;
      response.first().delete();
      valorPixMessage.delete();

      mercadopago.configurations.setAccessToken(dbcv.get('access_token'));
      const payment_data = {
        transaction_amount: Number(valorPix),
        description: `Pagamento - ${message.author.username}`,
        payment_method_id: 'pix',
        payer: {
          email: '', //coloque suas info
          first_name: 'white',
          last_name: 'dev',
          identification: {
            type: 'CPF',
            number: '',
          },
          address: {
            zip_code: '06233200',
            street_name: 'Av. das Nações Unidas',
            street_number: '3003',
            neighborhood: 'Bonfim',
            city: 'Osasco',
            federal_unit: 'SP',
          },
        },
      };

      const data = await mercadopago.payment.create(payment_data);

      // Criação do QR Code e envio
      const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, 'base64');
      const attachment = new Discord.MessageAttachment(buffer, 'payment.png');

      const embedqrcode = new Discord.MessageEmbed()
        .setImage('attachment://payment.png')
        .setFooter(`Para pagar com QR Code basta abrir o aplicativo do seu banco, clicar em QR Code e alinhar o celular com a imagem a seguir.`)
        .setTitle(`**${dbcv.get('title')} - QR Code <:Pix:1173443328050728991>**`)
        .setDescription(`<:cash:1209960384300187650> **Valor: ${valorPix}**\n <a:seta:1279688558797652081> **Horário: ${new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}**\n `)
        .setColor(dbcv.get('color'));

      await message.channel.send({ embeds: [embedqrcode], files: [attachment] });

      const copiaColaMessage = await message.channel.send(`# Está no celular? Pague utilizando o Copia e Cola:\n${data.body.point_of_interaction.transaction_data.qr_code}`);

      const paymentId = data.body.id;

      // Adicionando verificação de pagamento aprovado
      checkPaymentStatus(message, paymentId, valorPix, copiaColaMessage);
    } catch (error) {
      console.error('Erro durante o processamento do comando "gerarpix":', error);
      message.channel.send('Ocorreu um erro durante o processamento do comando.');
    }
  },
};

async function checkPaymentStatus(message, paymentId, valorPix, copiaColaMessage) {
  try {
    var time = setInterval(async () => {
      try {
        var res = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${config.get('accessToken')}`,
          },
        });

        if (res.data.status == 'approved') {
          console.clear();
          const approvalTime = new Date(res.data.date_approved).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          message.channel.send(`<a:verificado:1159554658788966450> **PAGAMENTO DE R$${valorPix} APROVADO!**\n**<a:seta_preta:1184051227282128947> ${approvalTime.split(' ')[0]}**`);
          console.log(`PAGAMENTO DE R$${valorPix} APROVADO`);
          clearInterval(time);
        }
      } catch (error) {
        console.error('Erro ao verificar o status do pagamento:', error);
      }
    }, 1000 * 3);
  } catch (error) {
    console.error('Erro ao configurar verificação de status de pagamento:', error);
  }
}
