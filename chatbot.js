const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));
const userStates = new Map(); // Controle de estado por usuário


function isHorarioComercial() {
    const agora = new Date();
    const dia = agora.getDay(); // 0 = Domingo, 6 = Sábado
    const hora = agora.getHours();
    const minutos = agora.getMinutes();
    const horarioAtual = hora * 60 + minutos;

    // Segunda a sexta: 08:00 - 18:00 (480 a 1080 minutos)
    if (dia >= 1 && dia <= 5) {
        return horarioAtual >= 480 && horarioAtual < 1080;
    }

    // Sábado: 08:00 - 12:00 (480 a 720 minutos)
    if (dia === 6) {
        return horarioAtual >= 480 && horarioAtual < 720;
    }

    // Domingo: fechado
    return false;
}


client.on('message', async msg => {
    const userId = msg.from;
    const userState = userStates.get(userId);
    const chat = await msg.getChat();

    const sendTyping = async (ms) => {
        await chat.sendStateTyping();
        await delay(ms);
    };

    // Verifica horário comercial
    const horarioComercial = isHorarioComercial();

    if (!horarioComercial) {
        await sendTyping(2000);
        await client.sendMessage(userId,
            'Olá!!\n\nEstamos fora do nosso expediente. 😎\n\n' +
            'Mas fique tranquilo(a)! Assim que retomarmos as atividades te responderemos.\n\n' +
            'Funcionamos de segunda a sexta-feira de 8h às 18h e aos sábados de 8h às 12h.');
        return;
    };

    // ...aqui continua o resto do seu código normalmente


    // ====== MENU PRINCIPAL ======
    if (!userState || userState === 'main') {
        if (/^(menu|oi|olá|ola|)$/i.test(msg.body)) {
            userStates.set(userId, 'main'); // Estado principal
            await sendTyping(2000);
            await client.sendMessage(userId,
                'Olá! Aqui é da Orthodontic!\n\nÉ uma alegria ter você com a gente!! 🤗\n\nComo podemos ajudar? Escolha a melhor opção:\n\n' +
                '1 - O que a Clínica oferece?\n2 - Agendar avaliação (aparelho dental ou outros tratamentos)\n3 - Agendar/Remarcar atendimento\n' +
                '4 - Quero saber o dia da minha manutenção\n5 - Assuntos financeiros\n6 - SugestõesReclamações\n\n' +
                'Conheça o nosso trabalho:\nhttps://share.google/4rT2ztaHbC4GzpDA3\nhttps://instagram.com/orthodontic.bhbarropreto\n\n' +
                '⚠ Para assuntos urgentes: ligue (31) 3201-4343.\n⏰ Horário: 2ª a 6ª de 8h às 18h | Sábado de 8h às 12h\n📍 Av. Augusto de Lima, 1155, Barro Preto.');
            return;
        }

        if (msg.body === '1') {
            userStates.set(userId, 'info_clinica');
            await sendTyping(2000);
            await client.sendMessage(userId,
                'Somos especialistas em ortodontia (correção do sorriso com aparelho dental).\n\n' +
                'Trabalhamos com todos os tipos de aparelho: metálico convencional, estético, autoligado, ortopédicos e Invisalign.\n' +
                'Também realizamos restaurações, extrações, clareamento, cirurgias, próteses, canal, implantes e mais.\n\n' +
                'Você deseja:\n1 - Agendar avaliação para aparelho\n2 - Agendar avaliação para outro tratamento');
            return;
        }

        if (msg.body === '2') {
            userStates.set(userId, 'main');
            await sendTyping(2000);
            await client.sendMessage(userId, 'https://wa.me/5531973054606?text=Agendar%20avalia%C3%A7%C3%A3o%20(aparelho%20dental%20ou%20outros%20tratamentos)');
            await delay(1000);
            await client.sendMessage(userId, 'Aguarde um instante que você logo será atendido⌛');
            return;
        }

        if (msg.body === '3') {
            userStates.set(userId, 'remarcar');
            await sendTyping(2000);
            await client.sendMessage(userId,
                'Você pode agendar ou remarcar pelo APP OrthoDontic Sorria Sempre:\n\n' +
                '📱 Apple Store: https://apps.apple.com/br/app/orthodontic-sorria-sempre/id1177087837\n' +
                '📱 Android: https://play.google.com/store/apps/details?id=com.ortodontic.clientes\n\n' +
                'Se preferir atendimento humano, digite 1');
            return;
        }

        if (msg.body === '4') {
            userStates.set(userId, 'manutencao');
            await sendTyping(2000);
            await client.sendMessage(userId,
                'Você pode consultar seu horário ou remarcar pelo APP OrthoDontic Sorria Sempre:\n\n' +
                '📱 Apple Store: https://apps.apple.com/br/app/orthodontic-sorria-sempre/id1177087837\n' +
                '📱 Android: https://play.google.com/store/apps/details?id=com.ortodontic.clientes\n\n' +
                'Se preferir atendimento humano, digite 1');
            return;
        }

        if (msg.body === '5') {
            userStates.set(userId, 'financeiro');
            await sendTyping(2000);
            await client.sendMessage(userId,
                'Conte para a gente o que você precisa:\n\n' +
                '1 - Boleto / Pix de parcela vencida\n2 - Boleto / Pix de parcela a vencer\n' +
                '3 - Renegociar pendências\n4 - Retomar tratamento\n5 - Iniciar tratamento\n6 - Outros assuntos');
            return;
        }

        if (msg.body === '6') {
            userStates.set(userId, 'main');
            await sendTyping(2000);
            await client.sendMessage(userId, 'https://wa.me/5531992976187?text=Gostaria%20de%20fazer%20uma%20reclama%C3%A7%C3%A3o');
            await delay(1000);
            await client.sendMessage(userId,
                'Estamos aqui para te ouvir.\nConte o que está incomodando e esse assunto será levado à gerência.\nEm breve você terá um retorno.');
            return;
        }
    }

    // ====== ESTADO: info_clinica ======
    if (userState === 'info_clinica') {
        if (msg.body === '1') {
            userStates.set(userId, 'main');
            await sendTyping(2000);
            await client.sendMessage(userId, 'https://wa.me/5531973054606?text=Agendar%20avalia%C3%A7%C3%A3o%20para%20aparelho%20dental');
        } else if (msg.body === '2') {
            userStates.set(userId, 'main');
            await sendTyping(2000);
            await client.sendMessage(userId, 'https://wa.me/5531973054606?text=Agendar%20avalia%C3%A7%C3%A3o%20para%20outro%20tratamento');
        } else {
            await client.sendMessage(userId, 'Por favor, digite 1 ou 2.');
        }
        return;
    }

    // ====== ESTADO: remarcar ======
    if (userState === 'remarcar' && msg.body === '1') {
        userStates.set(userId, 'main');
        await sendTyping(2000);
        await client.sendMessage(userId, 'https://wa.me/5531998781836?text=Quero%20remarcar%20%2F%20agendar%20meu%20atendimento');
        await delay(1000);
        await client.sendMessage(userId, 'Aguarde um instante que você logo será atendido⌛');
        return;
    }

    // ====== ESTADO: manutencao ======
    if (userState === 'manutencao' && msg.body === '1') {
        userStates.set(userId, 'main');
        await sendTyping(2000);
        await client.sendMessage(userId, 'https://wa.me/5531998781836?text=Quero%20consultar%20o%20dia%20da%20minha%20manuten%C3%A7%C3%A3o');
        await delay(1000);
        await client.sendMessage(userId, 'Aguarde um instante que você logo será atendido⌛');
        return;
    }

    // ====== ESTADO: financeiro ======
    if (userState === 'financeiro') {
        const links = {
            '1': 'https://wa.me/5531982567623?text=Boleto%20%2F%20Pix%20de%20parcela%20vencida',
            '2': 'https://wa.me/5531982567623?text=Boleto%20%2F%20Pix%20de%20parcela%20a%20vencer',
            '3': 'https://wa.me/5531982567623?text=Renegociar%20pend%C3%AAncias',
            '4': 'https://wa.me/5531982567623?text=Quero%20retomar%20o%20tratamento%20ortod%C3%B4ntico',
            '5': 'https://wa.me/5531982567623?text=Fiz%20avalia%C3%A7%C3%A3o%20e%20quero%20iniciar%20o%20tratamento',
            '6': 'https://wa.me/5531982567623?text=Outros%20assuntos'
        };

        const link = links[msg.body];
        if (link) {
            userStates.set(userId, 'main');
            await sendTyping(2000);
            await client.sendMessage(userId, link);
            await delay(1000);
            await client.sendMessage(userId, 'Clique no link acima e aguarde um instante que você logo será atendido⌛');
        } else {
            await client.sendMessage(userId, 'Por favor, digite uma opção válida de 1 a 6.');
        }
        return;
    }

});
