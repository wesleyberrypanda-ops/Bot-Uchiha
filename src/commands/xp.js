import { db } from '../config/database.js';
import { formatXP } from '../utils/helpers.js';

export async function commandXP(sock, message) {
    const userId = message.key.participant || message.key.remoteJid;
    const { xp, level } = db.getXP(userId);
    
    const xpParaProximo = level * 100;
    const response = `${formatXP(xp, level)}\n\nXP até o próximo nível: ${xpParaProximo - xp}\n\n💡 Continue conversando para ganhar mais XP!`;
    
    await sock.sendMessage(message.key.remoteJid, { text: response });
}

export async function commandRanking(sock, message) {
    const topUsers = db.getTopUsers(5);
    
    let ranking = '🏆 TOP 5 RANKING\n\n';
    topUsers.forEach((user, index) => {
        ranking += `${index + 1}️⃣ Nível ${user.level} | ${user.xp} XP\n`;
    });
    
    await sock.sendMessage(message.key.remoteJid, { text: ranking });
}

export async function commandRankingBalance(sock, message) {
    const topUsers = db.getTopBalance(5);
    
    let ranking = '💰 TOP 5 MAIS RICOS\n\n';
    topUsers.forEach((user, index) => {
        ranking += `${index + 1}️⃣ ${user.balance.toLocaleString('pt-BR')} moedas\n`;
    });
    
    await sock.sendMessage(message.key.remoteJid, { text: ranking });
}
