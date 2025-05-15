module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {

        console.log(`        
        
 
SEU NICK`) //nome aonde vai aparecer como "status do perfil"

    let green = '\x1b[32m',
    colorful = (color, string, reset = '\x1b[0m') => color + string + reset
    console.log(colorful(green, 
        
`✅ - [BOT] online!|${client.user.username}    
                       `))   




        var compteurStatus = 1
        setInterval(async () => {
            status =  [`V-BUCKS ✔`]
            compteurStatus = (compteurStatus + 1) % (status.length);
            client.user.setPresence({
                activities: [{
                    name: `${status[compteurStatus]}`,
                    type: "STREAMING",
                    url: ""// se quiser colocar algo aqui...
                }],
                  status: "streaming"})
        }, 5000);
    }
}
