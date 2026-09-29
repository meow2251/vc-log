const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// 通知用のチャンネルID
const NOTIFY_CHANNEL_ID = '1554359083023212665';

const { ActivityType } = require('discord.js'); // もし上の方にあったらそのまま、なければ追加

client.once('ready', () => {
    console.log(`ログイン完了: ${client.user.tag}`);
    // ボットのステータスを「オンライン」にして、プレイ中のゲームを設定する
    client.user.setPresence({
        activities: [{ name: 'zzz', type: ActivityType.Watching }],
        status: 'online',
    });
});
client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.member.user.bot) return;

    const userName = newState.member.displayName;
    const notifyChannel = client.channels.cache.get(NOTIFY_CHANNEL_ID);
    if (!notifyChannel) return;

    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    // 1. VCに参加した（入ってきた）とき
    if (!oldChannel && newChannel) {
        // 部屋に入った時点で、自分以外に誰もいなければ「開始」、すでに誰かいたら「参加」
        // （自分が入る前の人数をカウント）
        const memberCount = newChannel.members.filter(m => !m.user.bot).size;
        
        if (memberCount === 1) {
            notifyChannel.send(`🟢 **${userName}** が VC (${newChannel.name}) を開始しました。`);
        } else {
            notifyChannel.send(`🔵 **${userName}** が VC (${newChannel.name}) に参加しました。`);
        }
    }
    // 2. VCから退出したとき
    else if (oldChannel && !newChannel) {
        notifyChannel.send(`🔴 **${userName}** が VC (${oldChannel.name}) から退出しました。`);
    }
    // 3. 別のVCに移動したとき
    else if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
        notifyChannel.send(`🟡 **${userName}** が (${oldChannel.name}) から (${newChannel.name}) に移動しました。`);
    }
});// --- ここからミニサーバー（Renderを騙す用） ---
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Dummy server is listening on port ${PORT}`);
});
// --- ここまで ---

// Botのトークン
client.login(process.env.DISCORD_TOKEN);