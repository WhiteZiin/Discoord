const Discord = require("discord.js");
const client = new Discord.Client({ intents: 32767 });
const mercadopago = require("mercadopago")
const axios = require("axios")
const moment = require("moment")
const { WebhookClient } = require("discord.js")

const { JsonDatabase, } = require("wio.db");
const db = new JsonDatabase({ databasePath:"./databases/myJsonProdutos.json" });
const dbc = new JsonDatabase({ databasePath:"./databases/myJsonCupons.json" });
const db2 = new JsonDatabase({ databasePath:"./databases/myJsonDatabase.json" });
const db3 = new JsonDatabase({ databasePath:"./databases/myJsonIDs.json" });
const perms = new JsonDatabase({ databasePath:"./databases/myJsonPerms.json" });
const db4 = new JsonDatabase({ databasePath:"./databases/myJsonSaldo.json" });
const db7 = new JsonDatabase({ databasePath:"./databases/myJsonRankProdutos.json" });
const db8 = new JsonDatabase({ databasePath:"./databases/myJsonRankUsers.json" });
const dbcv = new JsonDatabase({ databasePath:"./databases/myJsonBotConfig.json" });
const config = new JsonDatabase({ databasePath:"./config.json" });

const { joinVoiceChannel } = require('@discordjs/voice');

client.login(config.get(`token`))

process.on('unhandledRejection', (reason, p) => {
  console.log('❌  | Algum erro detectado')
   console.log(reason, p)
});
process.on('multipleResolves', (type, promise, reason) => {
  console.log('❌  | Vários erros encontrados')
   console.log(type, promise, reason)
});
process.on('uncaughtExceptionMonito', (err, origin) => {
  console.log('❌  | Sistema bloqueado')
   console.log(err, origin)
});
process.on('uncaughtException', (err, origin) => {
  console.log('❌  | Erro encontrado')
   console.log(err, origin)
});

moment.locale("pt-br");
client.on('ready', () => {
	console.log(`\n🤖 Logado em: ${client.user.username}}\n\n👑 Bot exclusivamente da ${dbcv.get(`title`)}.\n\🤖 Feito totalmente em JavaScript\n`);
  
    client.user.setActivity(`${dbcv.get(`status`)}`, { type: "STREAMING", url: "https://www.twitch.tv/discord" });
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  if (message.channel.type == 'dm') return;
  if (!message.content.toLowerCase().startsWith(config.get(`prefix`).toLowerCase())) return;
  if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) return;
  const args = message.content
      .trim().slice(config.get(`prefix`).length)
      .split(/ +/g);
  const command = args.shift().toLowerCase();

  try {
      const commandFile = require(`./commands/${command}.js`)
      commandFile.run(client, message, args);
  } catch (err) { ; }
});






client.on("interactionCreate", (interaction) => {
  if (interaction.isButton()) {
    const eprod = db.get(interaction.customId);
      if (!eprod) return;
      const severi = interaction.customId;
        if (eprod) {
          const quantidade = db.get(`${severi}.conta`).length;
          const row = new Discord.MessageActionRow()
           .addComponents(
             new Discord.MessageButton()
               .setCustomId(interaction.customId)
               .setLabel('Adicionar ao Carrinho')
               .setEmoji(`<:carrinho:1128048685687771227>`)
               .setStyle('SUCCESS'),
    
        );

        

        const embed = new Discord.MessageEmbed()
          .setTitle(`${dbcv.get(`title`)} | Produto`)
          .setColor(dbcv.get(`color`))
          .setImage(db.get(`${interaction.customId}.banner`))
          .setDescription(`\`\`\`${db.get(`${interaction.customId}.desc`)}\`\`\`\n> **<a:planeta:1128037425499865310> | Nome:** \`${db.get(`${interaction.customId}.nome`)}\`\n> **<:dinheiro:1128037421284610159> | Preço:** \`R$${db.get(`${interaction.customId}.preco`).toLocaleString()}\`\n> **<:caixa:1128037423021047848> | Estoque:** \`${db.get(`${interaction.customId}.conta`).length}\``);          
          
          
        interaction.message.edit({ embeds: [embed], components: [row] })

        
            
        if (quantidade < 1) {
          const embedsemstock = new Discord.MessageEmbed()
            .setDescription(`<a:notify:1128051173857964142> | Este produto está sem estoque, aguarde um reabastecimento!`)
            .setColor(dbcv.get(`color`))
            
        
            if (quantidade < 1) {
              const embedslogsss = new Discord.MessageEmbed()
              .setTitle(`${dbcv.get(`title`)} | Logs`)
              .setColor(dbcv.get(`color`))
              .setDescription(`**<:warn:1128048343512273077> O estoque do produto \`\`${interaction.customId}\`\` Acabou e tem gente querendo comprar amigo!\n\n<:carrinho:1128048685687771227> Produto: \`\`${eprod.nome}\`\`**`)
              .setFooter({ text: `${dbcv.get(`title`)} - Todos os direitos reservados` })
              client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [embedslogsss], content: `||<@&${dbcv.get(`equipe`)}>||` })
            }
           
         
         interaction.reply({ embeds: [embedsemstock], ephemeral: true })
         

          return;

        }
       

        
        if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) {
          return interaction.reply({
              embeds: [
                  new Discord.MessageEmbed()
                      .setColor(dbcv.get(`color`))
                      .setDescription(`**<a:no:1128038157590462515> | Você já tem um carrinho criado!**`)
              ],
              ephemeral: true
          })
      }
            
        interaction.guild.channels.create(`🛒・${interaction.user.username}`, {
          type: "GUILD_TEXT",
          parent: dbcv.get(`category`),
          topic: interaction.user.id,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
            },
            
            {
             id: interaction.user.id,
             allow: ["VIEW_CHANNEL"],
             deny: ["SEND_MESSAGES"]
           }
         ]
        }).then(async (c) => {
          await interaction.reply({
              content: ` <a:load:1128032753192026112> | Criando seu carrinho...`,
              ephemeral: true
          })

          setTimeout(() => {
              interaction.editReply({
                  content: ` `,
                  embeds: [
                      new Discord.MessageEmbed()
                          .setTitle(`${dbcv.get(`title`)} | Sistema de Vendas`)
                          .setColor(dbcv.get(`color`))
                          .setDescription(`<a:sim:1128030804002484245> | ${interaction.user} **Seu carrinho foi aberto com sucesso em: ${c}, fique à vontade para adicionar mais produtos.**`)
                  ],
                  components: [
                      new Discord.MessageActionRow()
                          .addComponents(
                              new Discord.MessageButton()
                                  .setStyle('LINK')
                                  .setLabel('🛒・Ir para carrinho')
                                  .setURL(`https://discord.com/channels/${c.guildId}/${c.id}`)
                          )
                  ],
                  ephemeral: true
              });
          }, 500);
     

        let quantidade1 = 1;
        var precoalt = eprod.preco;
           var data_id = Math.floor(Math.random() * 999999999999999);
           db3.set(`${data_id}.id`, `${data_id}`)
           db3.set(`${data_id}.status`, `Pendente (1)`)
           db3.set(`${data_id}.userid`, `${interaction.user.id}`)
           db3.set(`${data_id}.dataid`, `${moment().format('LLLL')}`)
           db3.set(`${data_id}.nomeid`, `${eprod.nome}`)
           db3.set(`${data_id}.qtdid`, `${quantidade1}`)
           db3.set(`${data_id}.precoid`, `${precoalt}`)
           db3.set(`${data_id}.entrid`, `Ainda nada...`)
           db3.set(`${data_id}.formapagamento`, `Pago com dinheiro`)

           

           const embedlogsgs = new Discord.MessageEmbed()
           .setTitle(`${dbcv.get(`title`)} | Logs`)
           .setDescription(`**<a:sim:1128030804002484245> O carrinho de ${interaction.user} acaba de ser aberto. <a:sim:1128030804002484245>\n\n<a:pretoebranco:1128048678150619396>Id da compra: \`\`${data_id}\`\`\n<:carrinho:1128048685687771227> Produto: \`\`${eprod.nome}\`\`\n<:carteira:1128038547056754778> Preço: \`\`${precoalt}\`\`**`)
           .setColor(dbcv.get(`color`))
           .setFooter({ text: `${dbcv.get(`title`)} - Direitos reservados` })
          client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [embedlogsgs], content: `||<@&${dbcv.get(`equipe`)}>||` }) 

          const timer2 = setTimeout(function () {

           const logdssa = new Discord.MessageEmbed()
           .setTitle(`${dbcv.get(`title`)} | Logs`)
           .setColor(dbcv.get(`color`))
           .setDescription(`<a:no:1128038157590462515> O ${interaction.user} acabou de cancelar uma compra. <a:no:1128038157590462515>`)
           .setFooter({ text: `${dbcv.get(`title`)} - Direitos reservados` })
           client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [logdssa], content: `||<@&${dbcv.get(`equipe`)}>||` })

            if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
            const embedcancelar356 = new Discord.MessageEmbed()
             .setTitle(`${dbcv.get(`title`)} | Compra Cancelada`)
             .setDescription(`<a:no:1128038157590462515> | ${interaction.user} Seu carrinho foi fechado por inatividade, e todos os produtos foram devoldidos para o estoque. Você pode voltar a comprar quando quiser`)
             .setColor(dbcv.get(`color`))
             interaction.user.send({ embeds: [embedcancelar356] }) 
            db3.delete(`${data_id}`)
          }, 60000)

           
             
           const row = new Discord.MessageActionRow()

           .addComponents(
            new Discord.MessageButton()
            .setCustomId('addboton')
            .setLabel('+')
            .setStyle('SECONDARY'),

           )

           .addComponents(
            new Discord.MessageButton()
              .setCustomId('asd')
              .setLabel('✏️')        
              .setStyle('SUCCESS'),
              
                  
           )
             .addComponents(
               new Discord.MessageButton()
               .setCustomId('removeboton')
               .setLabel('-')
               .setStyle('SECONDARY'),
             )
               .addComponents(
                new Discord.MessageButton()
                  .setCustomId('cancelarbuy')
                  .setLabel('')
                  .setEmoji('<:lixo:1095471379081592984>')
                  .setStyle('DANGER'),
           );

           
          const embedsdf = new Discord.MessageEmbed()
          .setTitle(`**${dbcv.get(`title`)} | Termos de compra**`)
          .setDescription(`**${dbcv.get(`termos`)}**`)
          .setColor(dbcv.get(`color`))
          

           const embedsstermos = new Discord.MessageEmbed()
             .setTitle(`${dbcv.get(`title`)} | Sistema de Compra`)           
             .setColor(dbcv.get(`color`))
             .setDescription(`<:warn:1128048343512273077> | Olá <@${interaction.user.id}>, este é seu carrinho, fique á vontade para adicionar mais produtos ou fazer as modificações que achar necessário.\n\n<:warn:1128048343512273077> | Lembre-se de ler nossos termos de compra, para não ter nenhum problema futuramente, ao continuar com a compra, você concorda com nossos termos.\n\n<a:notify:1128051173857964142> | Quando estiver tudo pronto aperte o botão abaixo, para continuar com sua compra!`)
             .setFooter({ text: `${dbcv.get(`title`)} - Todos os direitos reservados.` })
             const row3 = new Discord.MessageActionRow()

             

           .addComponents(
            new Discord.MessageButton()
            .setCustomId('comprarboton')
            .setLabel('Aceitar e Continuar')
            .setEmoji("<a:sim:1128030804002484245>")
            .setStyle('SUCCESS'),

           )
           .addComponents(
           new Discord.MessageButton()
           .setCustomId('cancelarbuy')
           .setLabel('Cancelar')
           .setEmoji(`<a:no:1128038157590462515>`)
           .setStyle("DANGER")
           )

           .addComponents(
            new Discord.MessageButton()
            .setLabel('Ler os Termos')
            .setEmoji("📋")
            .setStyle("SECONDARY")
            .setCustomId(`termosget`)
            );

            
                                                
           const embedss = new Discord.MessageEmbed()
           .setDescription(`> <a:planeta:1128037425499865310>  **| Produto:** \`${eprod.nome}\`\n> <:caixa:1128037423021047848> **| Quantidade:** \`${quantidade1}\`\n> <:dinheiro:1128037421284610159> **| Preço** \`R$${precoalt}\``)
           .setColor(dbcv.get(`color`))
             c.send({ embeds: [embedsstermos], content: `||<@${interaction.user.id}>||`, components: [row3], fetchReply: true }).then(msg => {
              const filter = i => i.user.id === interaction.user.id;
              const collector = msg.createMessageComponentCollector({ filter });
              collector.on("collect", intera => {
                intera.deferUpdate()
                if (intera.customId === 'cancelarbuy') {
                  clearInterval(timer2);
                  const embedcancelar = new Discord.MessageEmbed()
                             .setTitle(`${dbcv.get(`title`)} | Compra Cancelada`)
                             .setDescription(`<a:no:1128038157590462515> | Você cancelou a compra, e todos os produtos foram devolvido para o estoque. Você pode voltar a comprar quando quiser!`)
                             .setColor(dbcv.get(`color`))
                             interaction.user.send({embeds: [embedcancelar]})

                             const logstaff = new Discord.MessageEmbed()
                             .setTitle(`${dbcv.get(`title`)} | Logs`)
                             .setColor(dbcv.get(`color`))
                             .setDescription(`<a:no:1128038157590462515> O ${interaction.user} acabou de cancelar uma compra. <a:no:1128038157590462515>`)
                             .setFooter({ text: `${dbcv.get(`title`)} - Direitos reservados` })
                             client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [logstaff], content: `||<@&${dbcv.get(`equipe`)}>||` })

                  db3.delete(`${data_id}`)
                  if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                }

                    if (intera.customId === "comprarboton") {
                      msg.channel.bulkDelete(50);
                      clearInterval(timer2);
                      const timer3 = setTimeout(function () {
                       if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                        db3.delete(`${data_id}`)
                  }, 600000)

                  

                      const row = new Discord.MessageActionRow()
                       
                        .addComponents(
                          new Discord.MessageButton()
                            .setCustomId('continuarboton')
                            .setLabel('Ir para o Pagamento')
                            .setEmoji(`<a:sim:1128030804002484245>`)
                            .setStyle('SUCCESS'),
                   )
                        .addComponents(
                          new Discord.MessageButton()
                            .setCustomId('cancelarboton')
                            .setLabel("")
                            .setEmoji(`<a:no:1128038157590462515>`)
                            .setStyle('DANGER'),
                      );
                                         
                      const embedss = new Discord.MessageEmbed()
                        .setTitle(`${dbcv.get(`title`)} | Resumo da Compra`)
                        .setDescription(`> <a:planeta:1128037425499865310> | Produto: \`${eprod.nome}\`\n> <:dinheiro:1128037421284610159> | Valor Unitário: \`R$${db.get(`${interaction.customId}.preco`).toLocaleString()}\`\n> <:caixa:1128037423021047848> | Produtos no Carrinho: \`${quantidade1}\`\n> <:carteira:1128038547056754778> | Valor Total: \`R$${precoalt}\`\n`)                                     
                        .setColor(dbcv.get(`color`))
                        
                      c.send({ embeds: [embedss], components: [row], content: `||<@${interaction.user.id}>||`, fetchReply: true }).then(msg => {
                        const filter = i => i.user.id === interaction.user.id;
                        const collector = msg.createMessageComponentCollector({ filter });
                        collector.on("collect", intera2 => {
                          intera2.deferUpdate()
                          if (intera2.customId === 'addcboton') {
                            row.components[1].setDisabled(true)
                            intera.channel.permissionOverwrites.edit(intera.user.id, { SEND_MESSAGES: true });
                             msg.channel.send("<a:load:1128032753192026112> | Qual o cupom?").then(mensagem => {
                              const filter = m => m.author.id === interaction.user.id;
                              const collector = mensagem.channel.createMessageCollector({ filter, max: 1 });
                              collector.on("collect", cupom => {
                                if(`${cupom}` !== `${dbc.get(`${cupom}.idcupom`)}`) {
                                  cupom.delete()
                                  mensagem.edit(`<a:no:1128038157590462515> | Isso não é um cupom!`)
                                  intera.channel.permissionOverwrites.edit(intera.user.id, { SEND_MESSAGES: false });
                                  return;
                                }
                                  
                                var minalt = dbc.get(`${cupom}.minimo`);
                                var dscalt = dbc.get(`${cupom}.desconto`);
                                var qtdalt = dbc.get(`${cupom}.quantidade`);
                                  
                                precoalt = Number.parseInt(precoalt) + Number.parseInt(`1`);
                                minalt = Number.parseInt(minalt) + Number.parseInt(`1`);
                                if(precoalt < minalt) {
                                  cupom.delete()
                                  intera.channel.permissionOverwrites.edit(intera.user.id, { SEND_MESSAGES: false });
                                  mensagem.edit(`<a:no:1128038157590462515> | Você não atingiu o mínimo!`)
                                  return;
                                } else {
                               
                                precoalt = Number.parseInt(precoalt) - Number.parseInt(`1`);
                                minalt = Number.parseInt(minalt) - Number.parseInt(`1`);
                                    
                                if(`${dbc.get(`${cupom}.quantidade`)}` === "0") {
                                  cupom.delete()
                                  intera.channel.permissionOverwrites.edit(intera.user.id, { SEND_MESSAGES: false });
                                  mensagem.edit(`<a:no:1128038157590462515> | Esse cupom saiu de estoque!`)
                                  return;
                                }
                                               
                                if(`${cupom}` === `${dbc.get(`${cupom}.idcupom`)}`) {
                                  cupom.delete()
                                  mensagem.edit(`<a:sim:1128030804002484245>| Cupom adicionado`)
                                   intera.channel.permissionOverwrites.edit(intera.user.id, { SEND_MESSAGES: false });
                                    var precinho = precoalt;
                                    var descontinho = "0."+dscalt;
                                    var cupomfinal = precinho * descontinho;
                                    precoalt = precinho - cupomfinal;
                                    qtdalt = qtdalt - 1;
                                    const embedss2 = new Discord.MessageEmbed()
                                      .setTitle(`${dbcv.get(`title`)} | Resumo da Compra`)
                                      .setDescription(`> <a:planeta:1128037425499865310> | Produto: \`${eprod.nome}\`\n> <:dinheiro:1128037421284610159> | Valor Unitário: \`R$${db.get(`${interaction.customId}.preco`).toLocaleString()}\`\n> <:caixa:1128037423021047848> | Produtos no Carrinho: \`${quantidade1}\`\n> <:carteira:1128038547056754778> | Valor Total: \`R$${precoalt}\`\n> <:cupom:1115828278620606515> | Cupom: \`${dbc.get(`${cupom}.idcupom`)}\``)                      
                                      .setColor(dbcv.get(`color`))

                                    msg.edit({ embeds: [embedss2], components: [row], content: `||<@${interaction.user.id}>||`, fetchReply: true })
                                    dbc.set(`${cupom}.quantidade`, `${qtdalt}`)
                                  }
                                }
                               }) 
                             })
                           }
                                     
                           if (intera2.customId === 'cancelarboton') {
                            clearInterval(timer3);
                            const embedcancelar2 = new Discord.MessageEmbed()
                           .setTitle(`${dbcv.get(`title`)} | Compra Cancelada`)
                           .setDescription(`<a:no:1128038157590462515> | Você cancelou a compra, e todos os produtos foram devolvido para o estoque. Você pode voltar a comprar quando quiser!`)
                           .setColor(dbcv.get(`color`))
                           interaction.user.send({embeds: [embedcancelar2]})

                           const asdaslog = new Discord.MessageEmbed()
                             .setTitle(`${dbcv.get(`title`)} | Logs`)
                             .setColor(dbcv.get(`color`))
                             .setDescription(`<a:no:1128038157590462515> O ${interaction.user} acabou de cancelar uma compra. <a:no:1128038157590462515>`)
                             .setFooter({ text: `${dbcv.get(`title`)} - Direitos reservados` })
                             client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [asdaslog], content: `||<@&${dbcv.get(`equipe`)}>||` })
                            db3.delete(`${data_id}`)
                            if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                          }


                            if (intera2.customId === "continuarboton") {
                              msg.channel.bulkDelete(50);
                              clearInterval(timer3);
                              const venda = setTimeout(function () {
                                const asdaslog = new Discord.MessageEmbed()
                                .setTitle(`${dbcv.get(`title`)} | Logs`)
                                .setColor(dbcv.get(`color`))
                                .setDescription(`<a:no:1128038157590462515> O ${interaction.user} acabou de cancelar uma compra. <a:no:1128038157590462515>`)
                                .setFooter({ text: `${dbcv.get(`title`)} - Direitos reservados` })
                                client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [asdaslog], content: `||<@&${dbcv.get(`equipe`)}>||` })

                                const embedcancelar3 = new Discord.MessageEmbed()
              .setTitle(`${dbcv.get(`title`)} | Compra Cancelada`)
              .setDescription(`<a:no:1128038157590462515> | ${interaction.user} Seu carrinho foi fechado por inatividade, e todos os produtos foram devoldidos para o estoque. Você pode voltar a comprar quando quiser`)
              .setColor(dbcv.get(`color`))
              interaction.user.send({ embeds: [embedcancelar3] })
                               if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                                db3.delete(`${data_id}`)
                               }, dbcv.get(`tempopagar`));
                               
                              mercadopago.configurations.setAccessToken(dbcv.get(`access_token`));
                              var payment_data = {
                                transaction_amount: Number(precoalt),
                                description: `Pagamento | ${interaction.user.username} | ${data_id}`,
                                payment_method_id: 'pix',
                                 payer: {
                                   email: 'japanstorepayments@gmail.com',
                                   first_name: 'Homero',
                                   last_name: 'Brum',
                                   identification: {
                                    type: 'CPF',
                                    number: '09111189770'
                                  },
                                    address: {
                                      zip_code: '06233200',
                                      street_name: 'Av. das Nações Unidas',
                                      street_number: '3003',
                                      neighborhood: 'Bonfim',
                                      city: 'Osasco',
                                      federal_unit: 'SP'
                                    }
                                  }
                                  
                                };


                                mercadopago.configure({
                                    access_token: dbcv.get(`access_token`)
                                });

                                const preference = {                             
                                  external_reference: '123453546363667890',
                                  items: [
                                      {
                                          title: eprod.nome,
                                          unit_price: Number.parseFloat(precoalt),
                                          quantity: 1,
                                      }         
                                  ],
                                  
                                  }

                                  let preference_id = null;
                                  mercadopago.preferences.create(preference)
                                  .then((response) => {
                                      preference_id = response.body.id;
                                  })
                                  .catch((error) => {
                                      console.log(error);
                                  });


                                
                                mercadopago.payment.create(payment_data).then(function (data) {
                                  db3.set(`${data_id}.status`, `Pendente (2)`)
                                  const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
                                  const attachment = new Discord.MessageAttachment(buffer, "payment.png");
                                  const checkout_link = `https://www.mercadopago.com.br/checkout/v1/redirect/payment-option-form/?preference-id=${preference_id}`
                                  const rowescolha = new Discord.MessageActionRow()
                                    
                                  .addComponents(   
                                    new Discord.MessageButton()
                                    .setCustomId('pixpays')
                                    .setEmoji(`<:pix:1128030889620815894>`)
                                    .setLabel("Pix")
                                    .setDisabled(dbcv.get(`pixtruedalse`))
                                    .setStyle('PRIMARY'),
                                   )  
                                   
                                    .addComponents(
                                      new Discord.MessageButton()
                                        .setCustomId('cancelarpix')
                                        .setEmoji(`<a:no:1128038157590462515>`)
                                        .setLabel("")
                                        .setStyle('DANGER'),
                                  );
                                  msg.channel.send('**\<a:load:1128032753192026112> | Gerando Pagamento com dados UTF-8...**').then(async tempMsg => {
                                    await new Promise(resolve => setTimeout(resolve, 8000)); // 5000 milissegundos = 5 segundos
                                    tempMsg.delete();
                                  
                                    const embedpendente2 = new Discord.MessageEmbed()
                                      .setTitle(`${dbcv.get(`title`)} | Sistema de Pagamento`)
                                      .setDescription(`\`\`\`Escolha uma forma de pagamento.\`\`\`\n> **<a:planeta:1128037425499865310> Produto:** \`${eprod.nome}\`\n> **<:caixa:1128037423021047848> | Produtos no Carrinho:** \`${quantidade1}\`\n> **<:dinheiro:1128037421284610159> Valor:** \`R$${precoalt}\``)
                                      .setImage(dbcv.get(`banner`)) 
                                      .setFooter(`Escolha entre as formas de pagamento abaixo.`)
                                      .setColor(dbcv.get(`color`));
                                  
                                    return msg.channel.send({ embeds: [embedpendente2], content: `||<@${interaction.user.id}>||`, components: [rowescolha] });
                                  }).then(msg => {
                                  const collector = msg.channel.createMessageComponentCollector();
                                 const lopp = setInterval(function () {
                                   const time2 = setTimeout(function () {
                                     clearInterval(lopp);
                                   }, 1800000)
                                  axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                                   headers: {
                                     'Authorization': `Bearer ${dbcv.get(`access_token`)}`
                                   }
                                 }).then(async (doc) => {
                                if (doc.data.collection.status === "approved") {
                                    db3.set(`${data_id}.status`, `Processando`)
                                    
                       
                                                   
                                }

                                const deltc = new Discord.MessageActionRow()
                                    
                                  .addComponents(   
                                    new Discord.MessageButton()
                                    .setCustomId('cancelarpix')
                                    .setEmoji(`❌`)
                                    .setLabel("Apagar Carrinho")
                                    .setStyle('PRIMARY'),
                                  );
                                      
                                if (`${db3.get(`${data_id}.status`)}` === "Processando") {
                                  clearTimeout(time2)
                                  clearInterval(lopp);
                                  clearInterval(venda);
                                  setTimeout(function () {
                                     if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }}, 80000)
                                   
                                     
                                    const a = db.get(`${severi}.conta`);
                                      db2.add("pedidostotal", 1)
                                      db2.add("gastostotal", Number(precoalt))
                                      db2.add(`${moment().format('L')}.pedidos`, 1)
                                      db2.add(`${moment().format('L')}.recebimentos`, Number(precoalt))
                                      db2.add(`${interaction.user.id}.gastosaprovados`, Number(precoalt))
                                      db2.add(`${interaction.user.id}.pedidosaprovados`, 1)
 
                                      if (a < quantidade1) {
                                        
                                           } else {
                                            const removed = a.splice(0, Number(quantidade1));
                                             db.set(`${severi}.conta`, a);
                                              const embedentrega = new Discord.MessageEmbed()
                                                .setTitle(`${dbcv.get(`title`)} | Seu produto`)
                                                .setDescription(`**<:estrela:1128037429392199760> | Id da Compra:** \`\`${data_id}\`\`\n\n**<a:sorteio:1128048360243335188> | Muito obrigado por comprar conosco <3\n\n<:warn:1128048343512273077> | Caso tenha algum problema, abra um ticket agora mesmo!**`)
                                                .setImage(dbcv.get(`banner`))
                                                .setThumbnail(dbcv.get(`foto`))
                                                .setColor(dbcv.get(`color`))

                                              interaction.user.send({ embeds: [embedentrega] })
                                              interaction.user.send(`📦 | Entrega do produto: ${eprod.nome} - ${quantidade1}/${quantidade1} \n 📦 | ${removed.join("\n 📦 |")}`)
                                               db3.set(`${data_id}.status`, `Concluido`)
                                               msg.channel.bulkDelete(50)
                                               msg.channel.send(`**<:estrela:1128037429392199760> ID da compra: \`\`${data_id}\`\`**`)
                                              const embedprocessando = new Discord.MessageEmbed()
                                              .setTitle(`${dbcv.get(`title`)} | Compra aprovada`)
                                              .setDescription(`**❤️ Obrigado por comprar conosco! ❤️**`)
                                              .setColor(dbcv.get(`color`))
                                              .setImage(dbcv.get(`banner`))
                                              c.send({ embeds:[embedprocessando], components: [deltc] })
                                                const membro = interaction.guild.members.cache.get(interaction.user.id)
                                                const rolex = db.get(`${interaction.customId}.rolex`)
                                                if (rolex !== null){
                                                  const roleasd = interaction.guild.roles.cache.find(role => role.id === db.get(`${interaction.customId}.rolex`))
                                                  membro.roles.add(roleasd)
                                                  const role = interaction.guild.roles.cache.find(role => role.id === dbcv.get(`role`))
                                                  membro.roles.add(role)
                                                } else {
                                                  const role = interaction.guild.roles.cache.find(role => role.id === dbcv.get(`role`))
                                                  membro.roles.add(role)
                                                }
                                                
                                                
 
                                                const rowavaliar = new Discord.MessageActionRow()

                                                .addComponents(
                                                  new Discord.MessageButton()
                                                  .setCustomId(`1star`)
                                                  .setLabel(`1`)
                                                  .setEmoji(`⭐`)
                                                  .setStyle(`SECONDARY`)
                                                )
                                                .addComponents(
                                                  new Discord.MessageButton()
                                                  .setCustomId(`2star`)
                                                  .setLabel(`2`)
                                                  .setEmoji(`⭐`)
                                                  .setStyle(`SECONDARY`)
                                                )
                                                .addComponents(
                                                  new Discord.MessageButton()
                                                  .setCustomId(`3star`)
                                                  .setLabel(`3`)
                                                  .setEmoji(`⭐`)
                                                  .setStyle(`SECONDARY`)
                                                )
                                                .addComponents(
                                                  new Discord.MessageButton()
                                                  .setCustomId(`4star`)
                                                  .setLabel(`4`)
                                                  .setEmoji(`⭐`)
                                                  .setStyle(`SECONDARY`)
                                                )
                                                .addComponents(
                                                  new Discord.MessageButton()
                                                  .setCustomId(`5star`)
                                                  .setLabel(`5`)
                                                  .setEmoji(`⭐`)
                                                  .setStyle(`SECONDARY`)
                                                );
      
                                                //Produtos rank:

                                                db7.set(`${eprod.nome}.idproduto`, `${interaction.customId}`)
                                                db7.add(`${eprod.nome}.vendasfeitas`, `${db3.get(`${data_id}.qtdid`)}`)
                                                db7.add(`${eprod.nome}.valoresganhos`, `${precoalt}`)

                                                //Users rank:

                                                db8.set(`${interaction.user}.userid`, `${interaction.user.id}`)
                                                db8.add(`${interaction.user}.comprasrealizadas`, `1`)
                                                db8.add(`${interaction.user}.valoresganhos`, `${precoalt}`)

                                                //Vendas soma:

                                                let sleep = async (ms) => await new Promise(r => setTimeout(r, ms));
                                                let avaliacao = "Nenhuma avaliação enviada..."
                                                const embed = await interaction.user.send({
                                                    embeds: [new Discord.MessageEmbed()
                                                        .setTitle(`❤️ ${dbcv.get(`title`)} | Faça uma avaliação ❤️`)
                                                        .setDescription(`**Caso queira, escolha uma nota para a venda:**`)
                                                        .setFooter(`Você tem 30 segundos para avaliar...`)
                                                        .setColor(dbcv.get(`color`))], components: [rowavaliar]})

                                                        const logstaffapr = new Discord.MessageEmbed()
                                                        .setTitle(`${dbcv.get(`title`)} | Logs`)
                                                        .setDescription(`**<a:sorteio:1128048360243335188> Nova compra aprovada <a:sorteio:1128048360243335188>\n\n<a:pretoebranco:1128048678150619396>Id da compra: \`\`${data_id}\`\`\n<:carrinho:1128048685687771227> Produto: \`\`${eprod.nome}\`\`\n<:carteira:1128038547056754778> Preço: \`\`${precoalt}\`\`\n<:caixa:1128037423021047848> Quantidade: \`\`${quantidade1}\`\`**`)
                                                        .setFooter({ text: `${dbcv.get(`title`)}Sosa - Direitos reservados` })
                                                        client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [logstaffapr], content: `||<@&${dbcv.get(`equipe`)}>||` })

                                                        

                                                setTimeout(() => {
                                                  


                                                const embedaprovadologstaff = new Discord.MessageEmbed()
                                                .setTitle(`${dbcv.get(`title`)} | Compra Aprovada`)
                                                .setDescription(`> **<:github:1128037426582003785> | Comprador:** ${interaction.user}\n> **<a:planeta:1128037425499865310> | Produto(s) Comprado(s):** \`\`${eprod.nome}\`\`\n> **<:caixa:1128037423021047848> | Quantidade Comprada:** \`\`${db3.get(`${data_id}.qtdid`)}\`\`\n> **<:dinheiro:1128037421284610159> | Valor Pago:** \`\`R$${precoalt}\`\`\n> **<:carteira:1128038547056754778> | Total gasto R$${gasto}\n> **<:calendar:1128037418281472091> | Data da compra:** ${moment().format('LLLL')}\n> **<:log:1128061912580640938> | ID da compra:** \`\`${data_id}\`\`\n> **<:log:1128061912580640938> | ID reembolso:** \`\`${data.body.id}\`\`\n> **<:mp:1128037431111852155> | Forma de pagamento:** \`\`${db3.get(`${data_id}.formapagamento`)}\`\`\n> **<:estrela:1128037429392199760> | Avaliação:** ${avaliacao}`)
                                                .setFooter({ text: `${dbcv.get(`title`)} - Todos os direitos reservados` })
                                                .setImage(dbcv.get(`banner`))
                                                .setThumbnail(dbcv.get(`foto`))
                                                .setColor(dbcv.get(`color`))
                                              client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [embedaprovadologstaff], content: `||<@${interaction.user.id}>||` })
                                              db3.set(`${data_id}.entrid`, `${removed.join(" \n")}`)

                                            
                                               const embedaprovadolog = new Discord.MessageEmbed()
                                               .setTitle(`${dbcv.get(`title`)} | Compra Aprovada`)
                                               .setDescription(`> **<:github:1128037426582003785>  |  Comprador:** ${interaction.user}\n> **<a:planeta:1128037425499865310> | Produto(s) Comprado(s):** \`\`${eprod.nome}\`\`\n> **<:caixa:1128037423021047848> | Quantidade Comprada:** \`\`${db3.get(`${data_id}.qtdid`)}\`\`\n> **<:dinheiro:1128037421284610159> | Valor Pago:** \`\`R$${precoalt}\`\`\n> **<:calendar:1128037418281472091> | Data da compra:** ${moment().format('LLLL')}\n> **<:estrela:1128037429392199760> | Avaliação:** ${avaliacao}`)
                                               .setFooter({ text: `${dbcv.get(`title`)} - Todos os direitos reservados` })
                                               .setImage(dbcv.get(`banner`))
                                               .setThumbnail(dbcv.get(`foto`))
                                               .setColor(dbcv.get(`color`))
                                              client.channels.cache.get(dbcv.get(`logs`)).send({ embeds: [embedaprovadolog], content: `||<@${interaction.user.id}>||` })

                                              }, 30000);
  
                                              const gasto = db8.get(`${interaction.userid}.gastosaprovados`) || "0";

const interacaoavaliar = embed.createMessageComponentCollector({ componentType: "BUTTON", });
interacaoavaliar.on("collect", async (interaction) => {
    if (interaction.user.id != interaction.user.id) {
        return;
    }

    if (interaction.isButton()) {
      var escrito = "Nada..."
      var textoest = ""
      var estrelas = interaction.customId.replace("star", "")

  for (let i = 0; i != estrelas; i++) {
      textoest = `${textoest} ⭐`
  }

  interaction.deferUpdate()
  embed.reply(`<a:sorteio:1128048360243335188> | Obrigado pela avaliação!`).then(msg => {
    
    
    const embednew = new Discord.MessageEmbed()
                                                          .setTitle(`❤️ ${dbcv.get(`title`)} | Faça uma avaliação ❤️`)
                                                          .setDescription("**Você é demais! Obrigado por avaliar a gente, isto ajuda muito!**")
                                                          .setFooter(`Muito pela avaliação, isso ajuda muito a nossa loja ! Volte sempre <3`)
                                                          .setColor(dbcv.get(`color`))
                                                          embed.edit({ embeds: [embednew], components: [] })

                                                          avaliacao = `${textoest} (${estrelas}) \`\`${escrito}\`\``


        

      
    })

    }})

                                              const row2 = new Discord.MessageActionRow()
                                              .addComponents(
                                                new Discord.MessageButton()
                                                  .setCustomId(interaction.customId)
                                                  .setLabel('Adicionar ao Carrinho')
                                                  .setEmoji("<:carrinho:1128048685687771227>")
                                                  .setStyle('SUCCESS'),
                                            );

                                            
                                                        
                                            const embed2 = new Discord.MessageEmbed()
                                              .setTitle(`${dbcv.get(`title`)} | Produto`)
                                              .setDescription(`\`\`\`${db.get(`${interaction.customId}.desc`)}\`\`\`\n**<a:planeta:1128037425499865310> | Nome: ${db.get(`${interaction.customId}.nome`)}**\n**<:carteira:1128038547056754778> | Preço: __${db.get(`${interaction.customId}.preco`).toLocaleString()}__**\n**<:caixa:1128037423021047848> | Estoque: __${db.get(`${interaction.customId}.conta`).length}__**`)
                                              .setColor(dbcv.get(`color`))
                                              .setImage(db.get(`${interaction.customId}.banner`))
  
                                                     interaction.message.edit({ embeds: [embed2], components: [row2] })}}})}, 10000)
                                                 
                                                     collector.on("collect", interaction => {
  
                                                      const rowpixpayments = new Discord.MessageActionRow()
                                                      .addComponents(
                                                        new Discord.MessageButton()
                                                        .setCustomId('codigo')
                                                        .setLabel('Copia e Cola')
                                                        .setEmoji("📱")
                                                        .setStyle('PRIMARY'),
                                                      )
                                                      .addComponents(
                                                        new Discord.MessageButton()
                                                        .setCustomId('qrcode')
                                                        .setLabel('QR Code')
                                                        .setEmoji("📓")
                                                        .setStyle('PRIMARY'),
                                                      )
                                                      
                                                      .addComponents(
                                                        new Discord.MessageButton()
                                                        .setCustomId('cancelarpix')
                                                        .setLabel('')
                                                        .setEmoji('<a:no:1128038157590462515>')
                                                        .setStyle('DANGER'),
                                                      );

                                                      

                                                      const rowpagarsite = new Discord.MessageActionRow()
                                                      .addComponents(
                                                        new Discord.MessageButton()
                                                        .setURL(checkout_link)
                                                        .setEmoji(`<:mp:1128037431111852155>`)
                                                        .setLabel(`Realizar Pagamento`)
                                                        .setStyle(`LINK`)
                                                      )

                                                      .addComponents(   
                                                        new Discord.MessageButton()
                                                        .setCustomId('pixpays')
                                                        .setEmoji(`<:pix:1128030889620815894>`)
                                                        .setLabel("Pix")
                                                        .setDisabled(dbcv.get(`pixtruedalse`))
                                                        .setStyle('PRIMARY'),
                                                      )     

                                                      .addComponents(
                                                        new Discord.MessageButton()
                                                        .setCustomId('cancelarpix')
                                                        .setLabel('')
                                                        .setEmoji('<a:no:1128038157590462515>')
                                                        .setStyle('DANGER'),
                                                      );
 
                                                        if (interaction.customId === 'pixpays') {
                                                          msg.channel.bulkDelete(50);
                                                          clearInterval(venda);
                                                          setTimeout(function () {
                                                            if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                                                             db3.delete(`${data_id}`)
                                                            }, 600000)
                                                         const embedpixpayments = new Discord.MessageEmbed()
                                                         .setTitle(`${dbcv.get(`title`)} | PIX`)
                                                         .setImage(dbcv.get(`banner`)) 
                                                         .setDescription(`\`\`\`Escolha uma forma de pagamento.\`\`\`\n> **<a:planeta:1128037425499865310> | Produto:**, \`${eprod.nome}\`\n> **<:dinheiro:1128037421284610159> | Valor:**, \`R$${precoalt}\``)
                                                           .setColor(dbcv.get(`color`))
                                                           .setFooter({ text: `Escolha entre os abaixo, após escolher, pague.` })
                                                         msg.channel.send({ embeds: [embedpixpayments], content: `||<@${interaction.user.id}>||`, components: [rowpixpayments] })
                                                         
                                                        }

                                                        if (interaction.customId === 'cancelarpix') {
                                                          clearInterval(lopp);
                                                          clearInterval(venda)
                                                          const embedcancelar3 = new Discord.MessageEmbed()
                             .setTitle(`${dbcv.get(`title`)} | Compra Cancelada`)
                             .setDescription(`<a:no:1128038157590462515> | Você cancelou a compra, e todos os produtos foram devolvido para o estoque. Você pode voltar a comprar quando quiser!`)
                             .setColor(dbcv.get(`color`))
                             
                             interaction.user.send({embeds: [embedcancelar3]})

                             const logstaff = new Discord.MessageEmbed()
                             .setTitle(`${dbcv.get(`title`)} | Logs`)
                             .setColor(dbcv.get(`color`))
                             .setDescription(`<a:no:1128038157590462515> O ${interaction.user} acabou de cancelar uma compra. <a:no:1128038157590462515>`)
                             .setFooter({ text: `${dbcv.get(`title`)} - Direitos reservados` })
                             client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [logstaff], content: `||<@&${dbcv.get(`equipe`)}>||` })
                                                          db3.delete(`${data_id}`)
                                                          if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                                                         }
                                                     
                                                        if (interaction.customId === "codigo") {
                                                          msg.channel.bulkDelete(50);
                                                          rowpixpayments.components[0].setDisabled(true)
                                                          const embed2 = new Discord.MessageEmbed()
                                                          .setTitle(`${dbcv.get(`title`)} | PIX`)
                                                          .setImage(dbcv.get(`banner`)) 
                                                          .setDescription(`\`\`\`Pague para receber o produto.\`\`\`\n> **<a:planeta:1128037425499865310> | Produto:** \`${eprod.nome}\`\n> **<:dinheiro:1128037421284610159> | Valor:** \`R$${precoalt}\``)
                                                            .setColor(dbcv.get(`color`))
                                                            .setFooter({ text: `Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!` })
                                                         msg.channel.send({ embeds: [embed2], content: `||<@${interaction.user.id}>||`, components: [rowpixpayments] })

                                                          setTimeout(() => {
                                                            
                                                           

                                                            msg.channel.send(`**<:pix:1128030889620815894> | Copia e Cola:**\n${data.body.point_of_interaction.transaction_data.qr_code}`)

                                                        }, 1000);
                                                        }
                                                        
                                                        if (interaction.customId === 'qrcode') {
                                                          msg.channel.bulkDelete(50);
                                                          rowpixpayments.components[1].setDisabled(true)
                                                         const embed2 = new Discord.MessageEmbed()
                                                         .setTitle(`${dbcv.get(`title`)} | PIX`)
                                                         .setImage(dbcv.get(`banner`)) 
                                                         .setDescription(`\`\`\`Pague para receber o produto.\`\`\`\n> **<a:planeta:1128037425499865310> | Produto:** \`${eprod.nome}\`\n> **<:dinheiro:1128037421284610159> | Valor:** \`R$${precoalt}\``)
                                                           .setColor(dbcv.get(`color`))
                                                           .setFooter({ text: `Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!` })
                                                         msg.channel.send({ embeds: [embed2], content: `||<@${interaction.user.id}>||`, components: [rowpixpayments] })
                                                         
                                                         setTimeout(() => {

                                                         const embedqrcode = new Discord.MessageEmbed()
                                                         .setImage("attachment://payment.png")
                                                         .setFooter(`Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!`)
                                                         .setTitle(`**${dbcv.get(`title`)} | QR Code**`)
                                                         .setDescription(`**Para para pagar com QR Code basta abrir o aplicativo do seu banco, clicar em QR Code e alinhar o celular com a imagem a seguir.**`)  
                                                         .setColor(dbcv.get(`color`))
                                                         msg.channel.send({ embeds: [embedqrcode],content: `<a:load:1128032753192026112> | Aguardando o Pagamento...`, files: [attachment] })

                                                        }, 1000);
                                                        }

                                                        if (interaction.customId === 'chavepix') {
                                                          msg.channel.bulkDelete(50);
                                                          rowpixpayments.components[2].setDisabled(true)
                                                         const embed2 = new Discord.MessageEmbed()
                                                         .setTitle(`${dbcv.get(`title`)} | PIX`)
                                                         .setImage(dbcv.get(`banner`)) 
                                                         .setDescription(`\`\`\`Pague para receber o produto.\`\`\`\n> **<a:planeta:1128037425499865310> | Produto:** \`${eprod.nome}\`\n> **<:dinheiro:1128037421284610159> | Valor:** \`R$${precoalt}\``)
                                                           .setColor(dbcv.get(`color`))
                                                           .setFooter({ text: `Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!` })
                                                         msg.channel.send({ embeds: [embed2], content: `||<@${interaction.user.id}>||`, components: [rowpixpayments] })
                                                         
                                                         setTimeout(() => {

                                                         const embedqrcode = new Discord.MessageEmbed()
                                                         .setFooter(`Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!`)
                                                         .setTitle(`**${dbcv.get(`title`)} | Chave Pix**`)
                                                         .setDescription(`**Chave Pix: ${dbcv.get(`chavepix`)}**`)  
                                                         .setColor(dbcv.get(`color`))
                                                         msg.channel.send({ embeds: [embedqrcode], content: `<a:load:1128032753192026112> | Aguardando o Pagamento...` })

                                                        }, 1000);
                                                        }

                                                        const rowdecidirsaldo = new Discord.MessageActionRow()
                                                      .addComponents(
                                                        new Discord.MessageButton()
                                                        .setCustomId('saldocomprar')
                                                        .setLabel('Adicionar ao Carrinho')
                                                        .setEmoji("<a:sim:1128030804002484245>")
                                                        .setStyle('SUCCESS'),
                                                      )
                                                      .addComponents(
                                                        new Discord.MessageButton()
                                                        .setCustomId('voltar1')
                                                        .setLabel('Voltar')
                                                        .setEmoji("⬅️")
                                                        .setStyle('PRIMARY'),
                                                      )

                                                      const saldototal = db4.get(`<@${interaction.user}>.saldo`) || "0";

                                                        if (interaction.customId === "saldodecidir") {
                                                          interaction.deferUpdate();
                                                          
                                                          const embedsaldodecidir = new Discord.MessageEmbed()
                                                          .setTitle(`${dbcv.get(`title`)} | Saldo`)
                                                          .setDescription(`**Você deseja efetuar o pagamento de \`\`${eprod.nome}\`\` no valor de \`\`R$${precoalt}\`\` utilizando seu saldo de \`\`S$${saldototal}\`\`?**`)
                                                          .setColor(dbcv.get(`color`))
                                                          msg.edit({ embeds: [embedsaldodecidir], components: [rowdecidirsaldo] })
                                                        }

                                                        if (interaction.customId === 'saldocomprar') {
                                                          interaction.deferUpdate();
                                                          const saldo = db4.get(`${interaction.user}.saldo`) || "0";
                                                          
                                                          if (saldo >= precoalt) {
                                                          db4.substr(`${interaction.user}.saldo`, `${precoalt}`)
                                                          db3.set(`${data_id}.formapagamento`, `Pago com saldo`)
                                                          db3.set(`${data_id}.status`, `Processando`)
                                                          
                                                          msg.channel.send(`**<a:sim:1128030804002484245> | Compra aprovada no valor de \`\`${precoalt}\`\`, este valor foi descontado do seu saldo.**`).then(msg => { setTimeout(() => msg.delete(), 5000)});
                                                      }
                                                           else {
                                                           
                                                          msg.channel.send(`**<a:no:1128038157590462515> | Você não tem saldo suficiente, valor do produto: \`\`${precoalt}\`\` e você tem \`\`${saldo}\`\`**`).then(msg => { setTimeout(() => msg.delete(), 5000)});
                                                        }
                                                        }

                                                        if (interaction.customId === "voltar1") {
                                                          interaction.deferUpdate();
                                                          rowescolha.components[1].setDisabled(true)
                                                          msg.channel.bulkDelete(50)
                                                          const embedded = new Discord.MessageEmbed()
                                   .setTitle(`${dbcv.get(`title`)} | Sistema de Pagamento`)
                                   .setDescription(`\`\`\`Escolha uma forma de pagamento.\`\`\`\n\n**<a:planeta:1128037425499865310> Produto:** ${eprod.nome}\n**<:carteira:1128038547056754778> Valor:** R$${precoalt}`)
                                   .setImage(dbcv.get(`banner`)) 
                                   .setThumbnail(dbcv.get(`foto`)) 
                                   .setColor(dbcv.get(`color`))
                                 msg.channel.send({ embeds: [embedded], content: `||<@${interaction.user.id}>||`, components: [rowescolha] })
                                                        }

                                                        if (interaction.customId === "pagarsite") {
                                                          msg.channel.bulkDelete(50);
                                                          clearInterval(venda);
                                                          const embedpagarsite = new Discord.MessageEmbed()
                                                          .setFooter(`Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!`)
                                                          .setTitle(`**${dbcv.get(`title`)} | Copia e cola**`)
                                                          .setDescription(`\`\`\`Pague para receber o produto.\`\`\`\n> **<a:planeta:1128037425499865310> | Produto:** \`${eprod.nome}\`\n> **<:dinheiro:1128037421284610159> | Valor:** \`R$${precoalt}\``)
                                                          .setImage(dbcv.get(`banner`)) 
                                                          .setThumbnail(dbcv.get(`foto`)) 
                                                          .setColor(dbcv.get(`color`))
                                                          msg.channel.send({ embeds: [embedpagarsite], components: [rowpagarsite], content: `||<@${interaction.user.id}>||` })


                                                        }

                                                        if (interaction.customId === "verificarpayments") {
                                                          interaction.deferUpdate();
                                                          const embedvefificarpayments = new Discord.MessageEmbed()
                                                          .setFooter(`Estamos verificando...`)
                                                          .setTitle(`**${dbcv.get(`title`)} | Verificar pagamento**`)
                                                          .setDescription(`**Ei, <@&${dbcv.get(`equipe`)}> venha conferir o seguinte pagamento de \`\`${precoalt}\`\` e caso esteja correto, entregue o produto.**`)
                                                          .setColor(dbcv.get(`color`))
                                                          msg.channel.send({ embeds: [embedvefificarpayments], content: `||<@${interaction.user.id}>||` })
                                                        }
                                                     
                                                        
                                                       })
                                                     })
                                                   }).catch(function (error) {
                                                     console.log(error)
                                                     });
                                                   }
                                                 })
                                              })
                                            }

                                           if (intera.customId === "termosget") {
                                            c.send({ embeds: [embedsdf], ephemeral: [true] });
                                           }

                                          })
                                        })  
           c.send({ embeds: [embedss], components: [row], fetchReply: true }).then(msg => {
             const filter = i => i.user.id === interaction.user.id;
             const collector = msg.createMessageComponentCollector({ filter });
             collector.on("collect", intera => {
               intera.deferUpdate()
               if (intera.customId === 'cancelarbuy') {
                clearInterval(timer2);
                const embedcancelar = new Discord.MessageEmbed()
                           .setTitle(`${dbcv.get(`title`)} | Compra Cancelada`)
                           .setDescription(`<a:no:1128038157590462515> | Você cancelou a compra, e todos os produtos foram devolvido para o estoque. Você pode voltar a comprar quando quiser!`)
                           .setColor(dbcv.get(`color`))
                           interaction.user.send({embeds: [embedcancelar]})

                           const logstaff = new Discord.MessageEmbed()
                           .setTitle(`${dbcv.get(`title`)} | Logs`)
                           .setColor(dbcv.get(`color`))
                           .setDescription(`<a:no:1128038157590462515> O ${interaction.user} acabou de cancelar uma compra. <a:no:1128038157590462515>`)
                           .setFooter({ text: `${dbcv.get(`title`)} - Direitos reservados` })
                           client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [logstaff], content: `||<@&${dbcv.get(`equipe`)}>||` })

                db3.delete(`${data_id}`)
                if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
              }
               if (intera.customId === "addboton") {
                if (quantidade1++ >= quantidade) {
                    const embedadici = new Discord.MessageEmbed()
                    .setDescription(`Você não pode adicionar um valor maior do que o estoque`)
                    .setColor(dbcv.get(`color`))
                    intera.channel.send({ embeds: [embedadici] }).then(msg => {
                      setTimeout(() => msg.delete(), 1500)
                  })
                    quantidade1--;
                    const embedss2 = new Discord.MessageEmbed()
                    .setDescription(`> <a:planeta:1128037425499865310>  **| Produto:** \`${eprod.nome}\`\n> <:caixa:1128037423021047848> **| Quantidade:** \`${quantidade1}\`\n> <:dinheiro:1128037421284610159> **| Preço** \`R$${precoalt}\``)
                    .setColor(dbcv.get(`color`))
                    msg.edit({ embeds: [embedss2] })
                } else {;
                  
                precoalt = Number(eprod.preco) + Number(precoalt)
                  
                    db3.set(`${data_id}.precoid`, `${precoalt}`)
                    db3.set(`${data_id}.qtdid`, `${quantidade1}`)
                    const embedss = new Discord.MessageEmbed()
                    .setDescription(`> <a:planeta:1128037425499865310>  **| Produto:** \`${eprod.nome}\`\n> <:caixa:1128037423021047848> **| Quantidade:** \`${quantidade1}\`\n> <:dinheiro:1128037421284610159> **| Preço** \`R$${precoalt}\``)
                    .setColor(dbcv.get(`color`))
                    msg.edit({ embeds: [embedss] })
                }
            }
            if (intera.customId === "removeboton") {
              if (quantidade1 <= 1) {
                const embedadici = new Discord.MessageEmbed()
                  .setDescription(`Você não pode remover mais produtos`)
                  .setColor(dbcv.get(`color`));
                intera.channel.send({ embeds: [embedadici] }).then(msg => {
                  setTimeout(() => msg.delete(), 1500);
                });
              } else {
                precoalt = precoalt - Number(eprod.preco); // Subtrai o preço do produto removido do valor total
                db3.set(`${data_id}.qtdid`, `${quantidade1}`);
                db3.set(`${data_id}.precoid`, `${precoalt}`);
                quantidade1--;
                const embedss = new Discord.MessageEmbed()
                  .setDescription(`> <a:planeta:1128037425499865310>  **| Produto:** \`${eprod.nome}\`\n> <:caixa:1128037423021047848> **| Quantidade:** \`${quantidade1}\`\n> <:dinheiro:1128037421284610159> **| Preço** \`R$${precoalt}\``)
                  .setColor(dbcv.get(`color`));
                msg.edit({ embeds: [embedss] });
              }
            }
            
                 
                   if (intera.customId === "comprarboton") {
                     msg.channel.bulkDelete(50);
                     clearInterval(timer2);
                     const timer3 = setTimeout(function () {
                      if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                       db3.delete(`${data_id}`)
                }, 600000)
                     const row = new Discord.MessageActionRow()
                      
                       .addComponents(
                         new Discord.MessageButton()
                           .setCustomId('continuarboton')
                           .setLabel('Ir para o Pagamento')
                           .setEmoji(`<a:sim:1128030804002484245>`)
                           .setStyle('SUCCESS'),
                     )
                     .addComponents(
                      new Discord.MessageButton()
                        .setCustomId('addcboton')
                        .setLabel('Cupom de Desconto')
                        .setEmoji(`<:cupom:1115828278620606515>`)
                        .setStyle('PRIMARY'),
                  )
                       .addComponents(
                         new Discord.MessageButton()
                           .setCustomId('cancelarboton')
                           .setLabel("")
                           .setEmoji(`<a:no:1128038157590462515>`)
                           .setStyle('DANGER'),
                     );
                                        
                     const embedss = new Discord.MessageEmbed()
                       .setTitle(`${dbcv.get(`title`)} | Resumo da Compra`)                   
                       .setDescription(`> <a:planeta:1128037425499865310> | Produto: \`${eprod.nome}\`\n> <:dinheiro:1128037421284610159> | Valor Unitário: \`R$${db.get(`${interaction.customId}.preco`).toLocaleString()}\`\n> <:caixa:1128037423021047848> | Produtos no Carrinho: \`${quantidade1}\`\n> <:carteira:1128038547056754778> | Valor Total: \`R$${precoalt}\`\n> <:carteira:1128038547056754778> | Cupom: \`Nenhum\``)                      
                       .setColor(dbcv.get(`color`))
                       
                     c.send({ embeds: [embedss], components: [row], content: `||<@${interaction.user.id}>||`, fetchReply: true }).then(msg => {
                       const filter = i => i.user.id === interaction.user.id;
                       const collector = msg.createMessageComponentCollector({ filter });
                       collector.on("collect", intera2 => {
                         intera2.deferUpdate()
                                    
                         if (intera2.customId === 'cancelarboton') {
                          clearInterval(timer3);
                          const embedcancelar2 = new Discord.MessageEmbed()
                         .setTitle(`${dbcv.get(`title`)} | Compra Cancelada`)
                         .setDescription(`<a:no:1128038157590462515> | Você cancelou a compra, e todos os produtos foram devolvido para o estoque. Você pode voltar a comprar quando quiser!`)
                         .setColor(dbcv.get(`color`))
                         interaction.user.send({embeds: [embedcancelar2]})

                         const asdaslog = new Discord.MessageEmbed()
                           .setTitle(`${dbcv.get(`title`)} | Logs`)
                           .setColor(dbcv.get(`color`))
                           .setDescription(`<a:no:1128038157590462515> O ${interaction.user} acabou de cancelar uma compra. <a:no:1128038157590462515>`)
                           .setFooter({ text: `${dbcv.get(`title`)} - Direitos reservados` })
                           client.channels.cache.get(dbcv.get(`logs_staff`)).send({ embeds: [asdaslog], content: `||<@&${dbcv.get(`equipe`)}>||` })
                          db3.delete(`${data_id}`)
                          if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                        }

                           if (intera2.customId === "continuarboton") {
                             msg.channel.bulkDelete(50);
                             clearInterval(timer3);
                             const venda = setTimeout(function () {
                              if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                               db3.delete(`${data_id}`)
                              }, 150000)
                              mercadopago.configurations.setAccessToken(dbcv.get(`access_token`));
                             var payment_data = {
                               transaction_amount: Number(precoalt),
                               description: `Pagamento | ${interaction.user.username}`,
                               payment_method_id: 'pix',
                                payer: {
                                  email: 'japanstorepayments@gmail.com',
                                  first_name: 'Homero',
                                  last_name: 'Brum',
                                   identification: {
                                     type: 'CPF',
                                     number: '09111189770'
                                   },
                                   address: {
                                     zip_code: '06233200',
                                     street_name: 'Av. das Nações Unidas',
                                     street_number: '3003',
                                     neighborhood: 'Bonfim',
                                     city: 'Osasco',
                                     federal_unit: 'SP'
                                   }
                                 }
                               };

                               mercadopago.payment.create(payment_data).then(function (data) {
                                 db3.set(`${data_id}.status`, `Pendente (2)`)
                                 const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
                                 const attachment = new Discord.MessageAttachment(buffer, "payment.png");
                                 const reponse = request.post(url, json=payment_data)
                                 const row = new Discord.MessageActionRow()
                                                              
                                 .addComponents(
                                  new Discord.MessageButton()
                                    .setCustomId('saldocomprar')
                                    .setEmoji("💰")
                                    .setLabel("Saldo")
                                    .setStyle('PRIMARY'),
                                 )                         
                                 .addComponents(
                                  new Discord.MessageButton()
                                    .setEmoji("<:mp:1128037431111852155>")
                                    .setLabel("Pagar no Site")
                                    .setStyle("PRIMARY")             
                                    .setCustomId(`pagarsite`),
                                
                                 )                    
                                   .addComponents(
                                     new Discord.MessageButton()
                                       .setCustomId('cancelarpix')
                                       .setEmoji("<a:no:1128038157590462515>")
                                       .setLabel("")
                                       .setStyle('DANGER'),
                                 );
                                const embed = new Discord.MessageEmbed()
                                  .setTitle(`${dbcv.get(`title`)} | Sistema de Pagamento`)
                                  .setDescription(`\`\`\`Pague para receber o produto.\`\`\`\n**> <a:planeta:1128037425499865310> | Produto:** \`${eprod.nome}\`\n> **<:dinheiro:1128037421284610159> | Valor:** \`R$${precoalt}\`\n\n**<:estrela:1128037429392199760> | ID da compra:**\n\`\`${data_id}\`\``)
                                  .setImage(dbcv.get(`banner`)) 
                                  .setFooter('Escolha a forma de pagamento utilizando os botões abaixo:')
                                  .setFooter({ text: `Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!` })
                                  .setColor(dbcv.get(`color`))
                                  
                                msg.channel.send({ embeds: [embed], content: `||<@${interaction.user.id}>||`, components: [row] }).then(msg => {

                                const collector = msg.channel.createMessageComponentCollector();
                                const lopp = setInterval(function () {
                                  const time2 = setTimeout(function () {
                                    clearInterval(lopp);
                                  }, 1800000)
                                 axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                                  headers: {
                                    'Authorization': `Bearer ${dbcv.get(`access_token`)}`
                                  }
                                }).then(async (doc) => {
                               if (doc.data.collection.status === "approved") {
                                   db3.set(`${data_id}.status`, `Processando`)
                               }

                              
                                     
                               if (`${db3.get(`${data_id}.status`)}` === "Processando") {
                                 clearTimeout(time2)
                                 clearInterval(lopp);
                                 clearInterval(venda);
                                  const vendadel = setTimeout(function () {
                                    if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }}, 30000)
                                   const a = db.get(`${severi}.conta`);
                                     db2.add("pedidostotal", 1)
                                     db2.add("gastostotal", Number(precoalt))
                                     db2.add(`${moment().format('L')}.pedidos`, 1)
                                     db2.add(`${moment().format('L')}.recebimentos`, Number(precoalt))
                                     db2.add(`${interaction.user.id}.gastosaprovados`, Number(precoalt))
                                     db2.add(`${interaction.user.id}.pedidosaprovados`, 1)

                                     if (a < quantidade1) {
                                       
                                          } else {
                                           const removed = a.splice(0, Number(quantidade1));
                                            db.set(`${severi}.conta`, a);
                                             const embedentrega = new Discord.MessageEmbed()
                                               .setTitle(`${dbcv.get(`title`)} | Seu produto`)
                                               .setDescription(`**<a:planeta:1128037425499865310> | Produtos:** \n  \`\`\`${removed.join("\n")}\`\`\`\n**<:estrela:1128037429392199760> | Id da Compra:** ${data_id}\n\n**<:warn:1128048343512273077> | Avalie a nossa loja [aqui](https://discord.com/channels/${c.guildId}/${config.get(`avaliacoes`)})** `)
                                               .setColor(dbcv.get(`color`))
                                               
                                             interaction.user.send({ embeds: [embedentrega] })
                                              db3.set(`${data_id}.status`, `Concluido`)
                                              msg.channel.send(`<a:planeta:1128037425499865310> | Pagamento aprovado!! Obrigado por comprar em nossa Loja. Seu produto será enviado na sua DM.`)
                                              msg.channel.send(`<:estrela:1128037429392199760> | ID Da compra: ||${data_id}||`)
                                              msg.channel.send(`<a:sim:1128030804002484245> | Carrinho fechara em menos de 1 min`)
                                               const membro = interaction.guild.members.cache.get(interaction.user.id)
                                               const role = interaction.guild.roles.cache.find(role => role.id === dbcv.get(`role`))
                                               membro.roles.add(role)

                                              
               
                                              
                                                
                                                           
                                                    const row2 = new Discord.MessageActionRow()
                                                      .addComponents(
                                                        new Discord.MessageButton()
                                                          .setCustomId(interaction.customId)
                                                          .setLabel('Adicionar ao Carrinho')
                                                          .setEmoji("<:carrinho:1128048685687771227>")
                                                          .setStyle('SECONDARY'),
                                                    );
                                                                
                                                    const embed2 = new Discord.MessageEmbed()
                                                      .setTitle(`${dbcv.get(`title`)} | Produto`)
                                                      .setDescription(`\`\`\`${db.get(`${interaction.customId}.desc`)}\`\`\`\n**<a:planeta:1128037425499865310> | Nome: ${db.get(`${interaction.customId}.nome`)}**\n**<:carteira:1128038547056754778> | Preço: __${db.get(`${interaction.customId}.preco`).toLocaleString()}__**\n**<:caixa:1128037423021047848> | Estoque: __${db.get(`${interaction.customId}.conta`).length}__**`)
                                                      .setColor(dbcv.get(`color`))
                                                      
                                                    interaction.message.edit({ embeds: [embed2], components: [row2] })}}})}, 10000)
                                                
                                                    collector.on("collect", interaction => {
                                                       if (interaction.customId === 'cancelarpix') {
                                                         clearInterval(lopp);
                                                         clearInterval(venda)
                                                         const embedcancelar3 = new Discord.MessageEmbed()
                            .setTitle(`${dbcv.get(`title`)} | Compra Cancelada`)
                            .setDescription(`<a:no:1128038157590462515> | Você cancelou a compra, e todos os produtos foram devolvido para o estoque. Você pode voltar a comprar quando quiser!`)
                            .setColor(dbcv.get(`color`))
                            
                            interaction.user.send({embeds: [embedcancelar3]})
                                                         db3.delete(`${data_id}`)
                                                         if ((interaction.guild.channels.cache.find(c => c.topic === interaction.user.id))) { c.delete(); }
                                                        }
                                                      })
                                                    })
                                                  }).catch(function (error) {
                                                    console.log(error)
                                                    });
                                                  }
                                                })
                                             })
                                           }
                                         })
                                       })
                                     })
                                   }
                                  }

            
            
            })