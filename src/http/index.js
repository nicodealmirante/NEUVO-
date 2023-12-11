const express = require('express')
const cors = require('cors')
const {join} = require('path')
const {createReadStream} = require('fs')

/**
 * Esta clase esta relacionada con todo lo que tiene que ver
 * con un endpoint o rutas de express para tener un punto de entrada
 * externo y flexible
 */

class ServerHttp {
    app;
    port;

    constructor(_port = 3003){
        this.port = _port
    }
 chatwootCtrl = async (req, res) => {
        const body = req.body;
        const attachments = body?.attachments
        const bot = req.bot;
    
        
            /**
             * La parte que se encarga de determinar si un mensaje es enviado al whatsapp del cliente
             */
            const checkIfMessage = body?.private == false && body?.event == "message_created" && body?.message_type === "outgoing"
            if (checkIfMessage) {
                const phone = body.conversation?.meta?.sender?.phone_number.replace('+', '')
                const content = body?.content ?? '';

                const file = attachments?.length ? attachments[0] : null;
                if (file) {
                    console.log(`Este es el archivo adjunto...`, file.data_url)
                    await bot.provider.sendMedia(
                        `${phone}@c.us`,
                         content,
                        {file.data_url}
                    );
                    res.send('ok')
                    return
                }
        


                /**
                 * esto envia un mensaje de texto al ws
                 */
               await bot.provider.sendtext(
                `${phone}@s.whatsapp.net`,
                content   
                );

                res.send('ok');
                return;
               
            }

            res.send('ok')
        } catch (error) {
            console.log(error)
            return res.status(405).send('Error')
        }
    }


    /**
     * Incia tu server http sera encargador de injectar el instanciamiento del bot
     */
    initialization = (bot = undefined) => {
        if(!bot){
            throw new Error('DEBES_DE_PASAR_BOT')
        }
        this.app = express()
        this.app.use(cors())
        this.app.use(express.json())

        this.app.use((req, _, next) => {
            req.bot = bot;
            next()
        })

        this.app.post(`/chatwoot`, this.chatwootCtrl)


        this.app.listen(3005, () => {
            console.log(``)
            console.log(`🦮 http://localhost:${this.port}/scan-qr`)
            console.log(``)
        })
    }

}

module.exports = ServerHttp
