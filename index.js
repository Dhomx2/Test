const keepAlive = require('./keep_alive');
keepAlive();
// سورس

const Discord = require('discord.js');
const client = new Discord.Client({
    intents: 131071,
});

// Fix MaxListeners warning
client.setMaxListeners(20);


client.on('ready', () => {
  console.log(`${client.user.tag} is on! ✅ `);

  const statuses = [
    '📌 اكتب +مساعدة لعرض الأوامر',
    ``,
    'programmed by 7d.5 👨‍💻', // يمديك تغير الحالة الي اي شي تبيه (تتغير كل عشر ثواني)
  ];

  let index = 0;

  setInterval(() => {
    const status = statuses[index];
    client.user.setActivity(status, { type: 'WATCHING' });

    index++;
    if (index === statuses.length) index = 0;
  }, 10000); // 15000 = 15 ثانية
});

// استدعاء ملف config.json
const config = require('./config.json');

// يستدعي جميع الكونست
const n8a6id = config.n8a6id;
const staffid = config.staffid;
const prefix = config.prefix;
const LOG_CHANNEL_ID = config.LOG_CHANNEL_ID;
const categoryID = config.categoryID;
const logChannelID = config.logChannelID;
const TICKET_LOG_CHANNEL_ID = config.TICKET_LOG_CHANNEL_ID;
const token = config.token; 




client.on("message", async (message) => {
if(message.content.startsWith(prefix + "نداء")) {
if(message.author.bot) return; 
if(!message.member.roles.cache.has(staffid)) return; 
const id = message.content.slice(0).trim().split(/ +/)
var args = message.content.split(" ").slice(2);
var come = args.join(" ");
let user = message.mentions.members.first() || message.guild.members.cache.get(id[1])
if(!user) return message.reply(`**:x: لا استطيع العثور على هذا الشخص \nطريقة الاستعمال: ${prefix}نداء <ايدي الشخص> (سبب النداء)**`)
if(!come) return message.reply(`**:x: اكتب السبب رجاء \nطريقة الاستعمال: ${prefix}نداء <ايدي الشخص> (سبب النداء)**`)
user.send(`**من فضلك تعال إلى <#${message.channel.id}> \n ${user}\n السبب : ${come}**`)
let embed = new Discord.MessageEmbed()
.setColor("GREEN")
.setDescription(`**✅ | تم ارسال النداء بنجاح ${user}**`)
.setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
message.channel.send(embed)
}
});

client.on('message', async message => {
    if (message.author.bot || !message.guild) return;
    if (!message.member.roles.cache.has(staffid)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // قفل الشات
    if (command === 'قفل') {
        try {
            await message.channel.updateOverwrite(message.guild.roles.everyone, {
                SEND_MESSAGES: false
            });
            message.channel.send('🔒 تم قفل الشات.');
        } catch (err) {
            console.error(err);
            message.channel.send('❌ حدث خطأ أثناء قفل الشات.');
        }
    }

    // فتح الشات
    else if (command === 'فتح') {
        try {
            await message.channel.updateOverwrite(message.guild.roles.everyone, {
                SEND_MESSAGES: true
            });
            message.channel.send('🔓 تم فتح الشات.');
        } catch (err) {
            console.error(err);
            message.channel.send('❌ حدث خطأ أثناء فتح الشات.');
        }
    }

    // إخفاء الشات
    else if (command === 'اخفاء') {
        try {
            await message.channel.updateOverwrite(message.guild.roles.everyone, {
                VIEW_CHANNEL: false
            });
            message.channel.send('👻 تم إخفاء الشات.');
        } catch (err) {
            console.error(err);
            message.channel.send('❌ حدث خطأ أثناء إخفاء الشات.');
        }
    }

    // إظهار الشات
    else if (command === 'اظهار') {
        try {
            await message.channel.updateOverwrite(message.guild.roles.everyone, {
                VIEW_CHANNEL: true
            });
            message.channel.send('👁️ تم إظهار الشات.');
        } catch (err) {
            console.error(err);
            message.channel.send('❌ حدث خطأ أثناء إظهار الشات.');
        }
    }
});

// --- مساعدة لإرسال اللوق ---
function getLogChannel(guild) {
  if (!guild) return null;
  const c = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (c && c.type === 'text') return c;
  // بديل: ابحث بقناة اسم 'log' أو 'logs'
  return guild.channels.cache.find(ch => ch.name && ['log','logs','logs-channel','server-logs'].includes(ch.name.toLowerCase()) && ch.type === 'text') || null;
}

function sendLog(guild, embed) {
  const ch = getLogChannel(guild);
  if (!ch) return console.warn('Log channel not found for guild:', guild ? guild.id : 'unknown');
  ch.send(embed).catch(err => console.error('Failed to send log:', err));
}

// --- عضو يدخل السيرفر ---
client.on('guildMemberAdd', member => {
  const embed = new Discord.MessageEmbed()
    .setTitle('🔔 إنضمام عضو')
    .setColor('GREEN')
    .addField('العضو', `${member.user.tag} (${member.id})`, true)
    .addField('تاريخ الإنشاء', member.user.createdAt.toUTCString(), true)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();
  sendLog(member.guild, embed);
});

// --- عضو يخرج / يتم طرده ---
client.on('guildMemberRemove', member => {
  const embed = new Discord.MessageEmbed()
    .setTitle('👋 خروج عضو')
    .setColor('ORANGE')
    .addField('العضو', `${member.user.tag} (${member.id})`, true)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();
  sendLog(member.guild, embed);
});

// --- بن / انهاء باند ---
client.on('guildBanAdd', (guild, user) => {
  const embed = new Discord.MessageEmbed()
    .setTitle('⛔ مستخدم تم حظره')
    .setColor('DARK_RED')
    .addField('المستخدم', `${user.tag} (${user.id})`, true)
    .setTimestamp();
  sendLog(guild, embed);
});

client.on('guildBanRemove', (guild, user) => {
  const embed = new Discord.MessageEmbed()
    .setTitle('✅ تم فك الحظر')
    .setColor('GREEN')
    .addField('المستخدم', `${user.tag} (${user.id})`, true)
    .setTimestamp();
  sendLog(guild, embed);
});

// --- حذف رسالة ---
client.on('messageDelete', message => {
  if (message.partial) { // في حالة partial
    return; // لتبسيط؛ يمكنك fetch لو بغيت
  }
  if (message.author && message.author.bot) return; // تجاهل بوتات
  const embed = new Discord.MessageEmbed()
    .setTitle('🗑️ تم حذف رسالة')
    .setColor('GREY')
    .addField('المرسل', `${message.author.tag} (${message.author.id})`, true)
    .addField('القناة', `${message.channel.name || message.channel.id}`, true)
    .addField('المحتوى', message.content ? message.content.substring(0,1024) : '[ميديا أو لا يمكن قراءتها]')
    .setTimestamp();
  sendLog(message.guild, embed);
});

// --- تعديل رسالة ---
client.on('messageUpdate', (oldMessage, newMessage) => {
  // تجاهل التحديثات غير المهمه أو البوتات
  if (oldMessage.partial || newMessage.partial) return;
  if (!oldMessage.guild) return;
  if (oldMessage.author && oldMessage.author.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const embed = new Discord.MessageEmbed()
    .setTitle('✏️ تم تعديل رسالة')
    .setColor('BLUE')
    .addField('المرسل', `${oldMessage.author.tag} (${oldMessage.author.id})`, true)
    .addField('القناة', `${oldMessage.channel.name || oldMessage.channel.id}`, true)
    .addField('قبل', oldMessage.content ? oldMessage.content.substring(0,1024) : '[غير متاح]')
    .addField('بعد', newMessage.content ? newMessage.content.substring(0,1024) : '[غير متاح]')
    .setTimestamp();
  sendLog(oldMessage.guild, embed);
});

// --- انشاء قناة ---
client.on('channelCreate', channel => {
  if (!channel.guild) return;
  const embed = new Discord.MessageEmbed()
    .setTitle('📁 إنشاء قناة')
    .setColor('GREEN')
    .addField('القناة', `${channel.name} (${channel.id})`)
    .addField('النوع', channel.type)
    .setTimestamp();
  sendLog(channel.guild, embed);
});

// --- حذف قناة ---
client.on('channelDelete', channel => {
  if (!channel.guild) return;
  const embed = new Discord.MessageEmbed()
    .setTitle('🗑️ حذف قناة')
    .setColor('RED')
    .addField('القناة', `${channel.name} (${channel.id})`)
    .addField('النوع', channel.type)
    .setTimestamp();
  sendLog(channel.guild, embed);
});

// --- انشاء رتبة ---
client.on('roleCreate', role => {
  const embed = new Discord.MessageEmbed()
    .setTitle('✨ إنشاء رتبة')
    .setColor('GREEN')
    .addField('الرتبة', `${role.name} (${role.id})`)
    .addField('اللون', role.hexColor)
    .setTimestamp();
  sendLog(role.guild, embed);
});

// --- حذف رتبة ---
client.on('roleDelete', role => {
  const embed = new Discord.MessageEmbed()
    .setTitle('🗑️ حذف رتبة')
    .setColor('RED')
    .addField('الرتبة', `${role.name} (${role.id})`)
    .setTimestamp();
  sendLog(role.guild, embed);
});

// --- تحديث عضو (nickname أو رولز) ---
client.on('guildMemberUpdate', (oldMember, newMember) => {
  // تفقد تغيير الاسم المستعار
  if (oldMember.nickname !== newMember.nickname) {
    const embed = new Discord.MessageEmbed()
      .setTitle('✳️ تغيير اللقب')
      .setColor('BLUE')
      .addField('العضو', `${newMember.user.tag} (${newMember.id})`)
      .addField('قبل', oldMember.nickname || '[لا يوجد]')
      .addField('بعد', newMember.nickname || '[لا يوجد]')
      .setTimestamp();
    sendLog(newMember.guild, embed);
  }

  // تفقد تغيّر الرتب (اختزالي)
  const oldRoles = oldMember.roles.cache.keyArray();
  const newRoles = newMember.roles.cache.keyArray();
  if (oldRoles.length !== newRoles.length) {
    const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removed = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));
    const embed = new Discord.MessageEmbed()
      .setTitle('🔁 تغيّر في رتب العضو')
      .setColor('ORANGE')
      .addField('العضو', `${newMember.user.tag} (${newMember.id})`)
      .addField('مضافة', added.size ? added.map(r => r.name).join(', ') : 'لا شيء', true)
      .addField('محذوفة', removed.size ? removed.map(r => r.name).join(', ') : 'لا شيء', true)
      .setTimestamp();
    sendLog(newMember.guild, embed);
  }
});

// --- حالة الصوت (دخول / خروج / mute / deafen) ---
client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.channelID !== newState.channelID) {
    // دخول قناة
    if (!oldState.channelID && newState.channelID) {
      const embed = new Discord.MessageEmbed()
        .setTitle('🔊 دخول صوتي')
        .setColor('GREEN')
        .addField('العضو', `${newState.member.user.tag} (${newState.id})`)
        .addField('القناة', `${newState.channel.name}`)
        .setTimestamp();
      sendLog(newState.guild, embed);
    }
    // خروج من قناة
    else if (oldState.channelID && !newState.channelID) {
      const embed = new Discord.MessageEmbed()
        .setTitle('🔈 خروج صوتي')
        .setColor('ORANGE')
        .addField('العضو', `${oldState.member.user.tag} (${oldState.id})`)
        .addField('القناة السابقة', `${oldState.channel.name}`)
        .setTimestamp();
      sendLog(oldState.guild, embed);
    }
    // انتقال بين قنوات
    else {
      const embed = new Discord.MessageEmbed()
        .setTitle('↔️ انتقال صوتي')
        .setColor('BLUE')
        .addField('العضو', `${newState.member.user.tag} (${newState.id})`)
        .addField('من', `${oldState.channel ? oldState.channel.name : 'غير معروف'}`, true)
        .addField('إلى', `${newState.channel ? newState.channel.name : 'غير معروف'}`, true)
        .setTimestamp();
      sendLog(newState.guild, embed);
    }
  }

  // mute / deaf changes
  if (oldState.selfMute !== newState.selfMute || oldState.selfDeaf !== newState.selfDeaf || oldState.serverMute !== newState.serverMute || oldState.serverDeaf !== newState.serverDeaf) {
    const embed = new Discord.MessageEmbed()
      .setTitle('🔔 تغيير حالة الصوت')
      .setColor('GREY')
      .addField('العضو', `${newState.member.user.tag} (${newState.id})`)
      .addField('selfMute', newState.selfMute, true)
      .addField('selfDeaf', newState.selfDeaf, true)
      .addField('serverMute', newState.serverMute, true)
      .addField('serverDeaf', newState.serverDeaf, true)
      .setTimestamp();
    sendLog(newState.guild, embed);
  }
});



client.on('message', async message => {
    if (message.author.bot || !message.guild) return;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'اذلف') {
if (!message.member.roles.cache.has(staffid)) {
    return message.reply('❌ ليس لديك صلاحية لطرد الأعضاء.');
}

// خذ الوسيط (ID أو منشن)
const args = message.content.split(' ').slice(1);
if (!args[0]) return message.reply('الرجاء منشن الشخص او كتابة الايدي الخاص به ❌');

let member;
// إذا المستخدم منشن
if (message.mentions.members.first()) {
    member = message.mentions.members.first();
} else {
    // حاول تجيب العضو عن طريق ID
    member = message.guild.members.cache.get(args[0]);
}

if (!member) {
    return message.reply('❌ لم أتمكن من العثور على العضو.');
}

if (!member.kickable) {
    return message.reply('❌ لا يمكنني طرد هذا العضو (ربما رتبته أعلى من رتبة البوت).');
}

const reason = args.slice(1).join(' ') || 'بدون سبب';

try {
    await member.kick(reason);
    message.channel.send(`✅ تم طرد ${member.user.tag} بسبب: ${reason}`);
} catch (error) {
    console.error(error);
    message.channel.send('❌ حدث خطأ أثناء محاولة الطرد.');
};
    };
});

client.on("message", message => {
  if (message.content === "السلام عليكم"){
    message.reply("عليكم السلام");
  }
});
  
client.on('message', message => {
  if (message.author.bot) return;

  if (!message.content.startsWith('+')) return;

  const args = message.content.slice(1).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'tax') {
    let input = args[0];

    // تحويل الأرقام العربية إلى إنجليزية
    if (input) {
      input = input.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    }

    const amount = parseFloat(input);

    if (isNaN(amount)) {
      return message.reply('❌ الرجاء كتابة رقم صالح. مثال: +tax 1000 أو +tax ١٠٠٠');
    }

    const tax = Math.ceil((amount * 20) / 19);
    const deducted = Math.ceil(tax - amount);

    message.channel.send(`${tax}`)
  }
});

const moment = require("moment");    
const thailandcodes1 = [
`اقول انقلع بس`,
`5k`,
`ولا شي`,
`30k`,
`ولا شي`,
`50k`,
`ولا شي`,
]
client.on('message', mrrakan => {
if(mrrakan.content.startsWith(prefix + 'spin')) {
    if (!mrrakan.member.roles.cache.has(staffid)) {
            return message.reply(' ❌ ليس لديك صلاحية للعب عجلة الحظ.');
        }
const thailandcodes = thailandcodes1[Math.floor(Math.random() * thailandcodes1.length)];
let embed = new Discord.MessageEmbed()
.setDescription(`جائزتك: **${thailandcodes}**`)
mrrakan.channel.send(embed)
}
})
////// قسم التكت
const disbut = require('discord-buttons');
disbut(client);
const fs = require('fs');
let points = JSON.parse(fs.readFileSync('./points.json', 'utf8'));
const pointsFile = './points.json';

// تأكد من وجود ملف النقاط
if (!fs.existsSync(pointsFile)) fs.writeFileSync(pointsFile, '{}');

// دالة لقراءة البيانات من الملف
function readPoints() {
  return JSON.parse(fs.readFileSync(pointsFile, 'utf8'));
}

// دالة لحفظ البيانات في الملف
function savePoints(data) {
  fs.writeFileSync(pointsFile, JSON.stringify(data, null, 2));
}

// دالة لإضافة نقطة
function addPoint(userId) {
  const data = readPoints();
  if (!data[userId]) data[userId] = { points: 0, claimed: null };
  data[userId].points += 1;
  savePoints(data);
}

// دالة للحصول على النقاط
function getPoints(userId) {
  const data = readPoints();
  return data[userId] ? data[userId].points : 0;
}

// دالة لتسجيل الشخص الذي استلم التذكرة
function claimTicket(channelId, userId) {
  const data = readPoints();
  if (!data[userId]) data[userId] = { points: 0, claimed: null };
  data[channelId] = { claimedBy: userId };
  savePoints(data);
}

// دالة للحصول على الشخص الذي استلم التذكرة
function getClaimed(channelId) {
  const data = readPoints();
  return data[channelId] ? data[channelId].claimedBy : null;
}

// أمر إنشاء التكت
client.on('message', async message => {
  if (message.content === `${prefix}تكت`) {
    if (!message.member.roles.cache.has(staffid))
      return message.reply('❌ هذا الأمر فقط للمسؤولين.');

    const embed = new Discord.MessageEmbed()
      .setColor('#00bfff')
      .setTitle('نظام التذاكر')
      .setDescription('اضغط على الزر لفتح تذكرة دعم');

    const button = new disbut.MessageButton()
      .setStyle('green')
      .setLabel('🎫 فتح تذكرة')
      .setID('create_ticket');

    message.channel.send({ embed: embed, buttons: [button] });
  }

  // نقاطي (خاص للإدارة)
if (message.content.startsWith(`${prefix}نقاطي`)) {
    const mention = message.mentions.users.first() || message.author;

    // التأكد أن كل ID عنده مفتاح points
    for (let id in points) {
        if (!points[id].points) points[id].points = 0;
    }

    // إذا الشخص ما موجود أصلاً في JSON نضيفه بصفر نقاط
    if (!points[mention.id]) points[mention.id] = { points: 0 };

    // ترتيب جميع الأعضاء تنازليًا
    let sorted = Object.entries(points)
        .sort((a, b) => b[1].points - a[1].points);

    // إيجاد المركز
    let rank = sorted.findIndex(([id, data]) => id === mention.id) + 1;
    let userPoints = points[mention.id].points;

    // إرسال النتيجة
    message.channel.send(`🏆 ${mention} عنده **${userPoints}** نقطة، المركز **${rank}**`);
};
  });
// الترتيب
client.on('message', async message => {
    if (message.content === `${prefix}توب`) {
        
          if (!message.member.roles.cache.has(staffid)) {
            return message.reply('عذرا هذا الامر مخصص للإدارة فقط ❌');
        }
        
        // جلب كل أعضاء السيرفر لتحديث cache
        await message.guild.members.fetch();

        // التأكد أن كل ID عنده مفتاح points
        for (let id in points) {
            if (!points[id].points) points[id].points = 0;
        }

        // ترتيب النقاط تنازلياً وأخذ أفضل 10 فقط
        let sorted = Object.entries(points)
            .sort((a, b) => b[1].points - a[1].points)
            .slice(0, 3);

        if (sorted.length === 0) {
            return message.channel.send('❌ لا يوجد أي شخص لديه نقاط.');
        }

        // تكوين النص للـ embed
        let leaderboard = sorted.map(([id, data], index) => {
            let member = message.guild.members.cache.get(id);
            let name = member ? member.user.tag : `<@${id}>`;
            return `**${index + 1}.** ${name} - ${data.points} نقطة`;
        }).join('\n');

        // إنشاء الـ embed
        let embed = new Discord.MessageEmbed()
            .setTitle('🏆 قائمة التوب')
            .setColor('#FFD700')
            .setDescription(leaderboard)
            .setFooter('نظام النقاط');

        message.channel.send(embed);
    }
});
//  اضافة وازالة النقاط
client.on('message', async message => {
    if (message.author.bot || !message.guild) return;

    const args = message.content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // ====== إضافة نقاط ======
    if (command === `${prefix}زيد`) {
        if (!message.member.roles.cache.has(n8a6id))
            return message.reply("❌ لست مسؤول عن النقاط");

        let member = message.mentions.users.first() || client.users.cache.get(args[0]);
        let amount = parseInt(args[1]);

        if (!member || isNaN(amount)) 
            return message.reply("❌ استخدم: `+اضافة @منشن العدد` أو `+زيد ID العدد`");

           // نقاط قبل العملية
        let oldPoints = points[member.id] ? points[member.id].points : 0;

        if (!points[member.id]) points[member.id] = { points: 0 };
        points[member.id].points += amount;

        fs.writeFileSync('./points.json', JSON.stringify(points, null, 2));

        message.channel.send(`✅ تمت إضافة **${amount}** نقطة لـ ${member.username} (المجموع: ${points[member.id].points})`);

        // ====== إرسال لوق الإيمبد ======
        const logChannel = message.guild.channels.cache.get(logChannelID);
        if (logChannel) {
            const embed = new Discord.MessageEmbed()
                .setTitle('📝 سجل النقاط')
                .setColor('GREEN')
                .addField('نوع العملية', 'إضافة نقاط', true)
                .addField('المسؤول', `<@${message.author.id}>`, true)
                .addField('المستلم', `<@${member.id}>`, true)
                .addField('نقاط قبل العملية', oldPoints.toString(), true)
                .addField('عدد النقاط المضافة', amount.toString(), true)
                .addField('إجمالي النقاط بعد العملية', points[member.id].points.toString(), true)
                .setTimestamp();

            logChannel.send(embed);
        }
    }
    
    // اعادة تعين النقاط
    if (command === `${prefix}اعادة`) {
    if (!message.member.roles.cache.has(n8a6id))
        return message.reply("❌ لست مسؤول عن النقاط");

    const targetArg = args[0]; // ممكن يكون منشن أو ID أو "الكل"

    const logChannel = message.guild.channels.cache.get(logChannelID);
    let embed = new Discord.MessageEmbed()
        .setTitle('📝 سجل النقاط')
        .setColor('ORANGE')
        .addField('المسؤول', `<@${message.author.id}>`, true)
        .setTimestamp();

    if (!targetArg) return message.reply("❌ استخدم: `+اعادة @عضو` أو `+اعادة ID` أو `+اعادة الكل`");

    // ==== إعادة تعيين لكل الأعضاء ====
    if (targetArg.toLowerCase() === "الكل") {
        let resetCount = 0;
        for (let id in points) {
            const oldPoints = points[id].points;
            points[id].points = 0;
            resetCount++;

            if (logChannel) {
                embed.addField('المستلم', `<@${id}>`, true);
                embed.addField('نقاط قبل العملية', oldPoints.toString(), true);
                embed.addField('نقاط بعد العملية', '0', true);
                embed.addField('نوع العملية', 'إعادة تعيين نقاط', true);
                logChannel.send(embed);
                embed.fields = []; // تفريغ الحقول للإيمبد التالي
            }
        }
        fs.writeFileSync('./points.json', JSON.stringify(points, null, 2));
        return message.channel.send(`✅ تم إعادة تعيين نقاط جميع الأعضاء (${resetCount})`);
    }

    // ==== إعادة تعيين عضو محدد ====
    let member = message.mentions.users.first() || client.users.cache.get(targetArg);
    if (!member) return message.reply("❌ العضو غير موجود");

    const oldPoints = points[member.id] ? points[member.id].points : 0;
    if (!points[member.id]) points[member.id] = { points: 0 };
    points[member.id].points = 0;

    fs.writeFileSync('./points.json', JSON.stringify(points, null, 2));

    message.channel.send(`✅ تم إعادة تعيين نقاط ${member.username} (نقاطه السابقة: ${oldPoints})`);

    if (logChannel) {
        embed.addField('المستلم', `<@${member.id}>`, true);
        embed.addField('نقاط قبل العملية', oldPoints.toString(), true);
        embed.addField('نقاط بعد العملية', '0', true);
        embed.addField('نوع العملية', 'إعادة تعيين نقاط', true);
        logChannel.send(embed);
    }
}

    // ====== إزالة نقاط ======
    if (command === `${prefix}نقص`) {
        if (!message.member.roles.cache.has(n8a6id))
            return message.reply("❌ لست مسؤول عن النقاط");

        let member = message.mentions.users.first() || client.users.cache.get(args[0]);
        let amount = parseInt(args[1]);

        if (!member || isNaN(amount)) 
            return message.reply("❌ استخدم: `+ازالة @منشن العدد` أو `+نقص ID العدد`");

           // حفظ نقاط قبل الإزالة
    let oldPoints = points[member.id] ? points[member.id].points : 0;

    if (!points[member.id]) points[member.id] = { points: 0 };
    points[member.id].points -= amount;
    if (points[member.id].points < 0) points[member.id].points = 0;

    fs.writeFileSync('./points.json', JSON.stringify(points, null, 2));

    message.channel.send(`✅ تمت إزالة **${amount}** نقطة من ${member.username} (المجموع: ${points[member.id].points})`);

    // ====== إرسال لوق الإيمبد ======
    const logChannel = message.guild.channels.cache.get(logChannelID);
    if (logChannel) {
        const embed = new Discord.MessageEmbed()
            .setTitle('📝 سجل النقاط')
            .setColor('RED')
            .addField('نوع العملية', 'إزالة نقاط', true)
            .addField('المسؤول', `<@${message.author.id}>`, true)
            .addField('المستلم', `<@${member.id}>`, true)
            .addField('نقاط قبل العملية', oldPoints.toString(), true)
            .addField('عدد النقاط المزالة', amount.toString(), true)
            .addField('إجمالي النقاط بعد العملية', points[member.id].points.toString(), true)
            .setTimestamp();

        logChannel.send(embed);
        }
    }
});


// التعامل مع أزرار التكت
let ticketCount = 0;
let ticketsData = {};


client.on('clickButton', async button => {

  // إنشاء تذكرة
  if (button.id === 'create_ticket') {
    ticketCount++;
    let ticketName = `ticket-${String(ticketCount).padStart(3, '0')}`;

    let existing = button.guild.channels.cache.find(c =>
      c.topic === `ID: ${button.clicker.user.id}`
    );
    if (existing) return button.reply.send('❗ لديك تذكرة مفتوحة مسبقًا.', true);

    let channel = await button.guild.channels.create(ticketName, {
      type: 'text',
      topic: `ID: ${button.clicker.user.id}`,
      parent: categoryID,
      permissionOverwrites: [
        { id: button.guild.id, deny: ['VIEW_CHANNEL'] },
        { id: button.clicker.user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
        { id: client.user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_CHANNELS'] },
        { id: staffid, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] }
      ]
    });

    ticketsData[channel.id] = {
      name: ticketName,
      creator: button.clicker.user,
      createdAt: new Date(),
      claimedBy: null,
      claimedAt: null,
      closedBy: null,
      closedAt: null
    };

    let closeBtn = new disbut.MessageButton()
      .setStyle('red')
      .setLabel('🔒 إغلاق التذكرة')
      .setID('close_ticket');

    let claimBtn = new disbut.MessageButton()
      .setStyle('blurple')
      .setLabel('🎯 استلام التذكرة')
      .setID('claim_ticket');

    channel.send(`<@&${staffid}> <@${button.clicker.user.id}>`, {
      embed: new Discord.MessageEmbed()
        .setTitle('🎟️ تذكرة جديدة')
        .setDescription('يرجى وصف مشكلتك بالتفصيل، سيصلك رد قريبًا.')
        .setColor('#00bfff'),
      buttons: [claimBtn, closeBtn]
    });

    button.reply.send(`✅ تم إنشاء تذكرتك: <#${channel.id}>`, true);
  }

  // استلام التذكرة
  if (button.id === 'claim_ticket') {
    let data = ticketsData[button.channel.id];
    if (!data) return;

    data.claimedBy = button.clicker.user;
    data.claimedAt = new Date();

    if (!button.clicker.member.roles.cache.has(staffid))
      return button.reply.send('❌ هذا الزر مخصص للإدارة فقط.', true);
      claimTicket(button.channel.id, button.clicker.user.id);

    const claimedBy = `<@${button.clicker.user.id}>`;

    const claimedEmbed = new Discord.MessageEmbed()
      .setColor('#00bfff')
      .setTitle('📌 تم استلام التذكرة')
      .setDescription(`تم استلام هذه التذكرة بواسطة ${claimedBy}`);

    const disabledClaim = new disbut.MessageButton()
      .setStyle('green')
      .setLabel(`🎯 تم الاستلام بواسطة ${button.clicker.user.username}`)
      .setID('claimed')
      .setDisabled();

    const closeBtn = new disbut.MessageButton()
      .setStyle('red')
      .setLabel('🔒 إغلاق التذكرة')
      .setID('close_ticket');

    button.message.edit({ embed: claimedEmbed, buttons: [disabledClaim, closeBtn] });

    button.reply.send('📌 تم استلام التذكرة بنجاح.', true);
  }

     // إغلاق التذكرة
  if (button.id === 'close_ticket') {
    let data = ticketsData[button.channel.id];
    if (!data) return;

    data.closedBy = button.clicker.user;
    data.closedAt = new Date();

    // تحقق من أن الي قفل التذكرة هو المستلم أو عنده أدمن
    let member = button.guild.members.cache.get(button.clicker.user.id);
    let isAdmin = member.hasPermission('ADMINISTRATOR');
    let isClaimer = data.claimedBy && data.claimedBy.id === button.clicker.user.id;
 
    // تحديث النقاط إذا قفل التذكرة
    let newPoints = null;
    if (isAdmin || isClaimer) {
        if (!points[button.clicker.user.id]) {
            points[button.clicker.user.id] = { points: 0 };
        }
        points[button.clicker.user.id].points += 1;
        newPoints = points[button.clicker.user.id].points;

        fs.writeFileSync('./points.json', JSON.stringify(points, null, 2));
    }


    // ارسال التقرير
    let logChannel = button.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);
    if (logChannel) {
      let embed = new Discord.MessageEmbed()
        .setTitle(`🎫 تقرير التذكرة: ${data.name}`)
        .setColor('#ff0000')
        .addField('📌 من فتح التذكرة', `<@${data.creator.id}>`, true)
        .addField('🕒 وقت الفتح', data.createdAt.toLocaleString(), true)
        .addField('✅ تم الاستلام بواسطة', data.claimedBy ? `<@${data.claimedBy.id}>` : '❌ لم يتم الاستلام', true)
        .addField('🕒 وقت الاستلام', data.claimedAt ? data.claimedAt.toLocaleString() : '❌ -', true)
        .addField('🔒 تم الإغلاق بواسطة', `<@${data.closedBy.id}>`, true)
        .addField('🕒 وقت الإغلاق', data.closedAt.toLocaleString(), true);

      // نضيف النقاط إذا أخذ نقطة
      if (newPoints !== null) {
        embed.addField('🏆 النقاط', `${button.clicker.user} حصل على **+1 نقطة** (الإجمالي: ${newPoints})`);
      }

      embed.setFooter('نظام التذاكر');
      logChannel.send(embed); 
    }

    delete ticketsData[button.channel.id];

    button.reply.send('🔒 سيتم إغلاق التذكرة...', true);
    setTimeout(() => {
      button.channel.delete();
    }, 5000);
  };
});

client.on('message', async message => {
    if (message.content.startsWith('+add')) {
        
        if (!message.member.roles.cache.has(staffid)) {
            return message.reply("❌ ما عندك الصلاحية تستخدم هذا الأمر.");
        }
        
        if (!message.channel.name.startsWith('ticket-')) {
            return message.reply('❌ هذا الأمر يُستخدم فقط داخل قنوات التذاكر.');
        }

        // جلب العضو سواء بالمنشن أو الآيدي
        const args = message.content.split(' ');
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);

        if (!member) return message.reply('⚠️ لازم تمنشن العضو أو تكتب الآيدي حقه.');

        message.channel.updateOverwrite(member.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            READ_MESSAGE_HISTORY: true
        });

        message.channel.send(`✅ تم إضافة ${member} إلى هذه التذكرة.`);
    }
});

client.on('message', async message => {
    if (message.content.startsWith('+remove')) {
        
        if (!message.member.roles.cache.has(staffid)) {
            return message.reply("❌ ما عندك الصلاحية تستخدم هذا الأمر.");
        }
        
        if (!message.channel.name.startsWith('ticket-')) {
            return message.reply('❌ هذا الأمر يُستخدم فقط داخل قنوات التذاكر.');
        }

        // جلب العضو سواء بالمنشن أو الآيدي
        const args = message.content.split(' ');
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);

        if (!member) return message.reply('⚠️ لازم تمنشن العضو أو تكتب الآيدي حقه.');

        message.channel.updateOverwrite(member.id, {
            VIEW_CHANNEL: false,
            SEND_MESSAGES: false,
            READ_MESSAGE_HISTORY: false
        });

        message.channel.send(`✅ تم إزالة ${member} من هذه التذكرة.`);
    }
});



///// اوامر عامة
client.on('message', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('+مسح')) return;

  // صلاحيات
  if (!message.member.roles.cache.has(staffid)) {
    return message.reply('❌ ليس لديك الصلاحية لاستخدام هذا الامر');
  }

  // استخراج العدد
  const args = message.content.split(' ');
  const amount = parseInt(args[1]);

  // تحقق من الرقم
  if (isNaN(amount) || amount < 1 || amount > 100) {
    return message.reply('❗ اكتب رقم بين 1 و 100، مثال: `+مسح 20`');
  }

  // تنفيذ الحذف
  try {
    await message.channel.bulkDelete(amount, true);
    message.channel.send(`✅ تم مسح ${amount} رسالة.`).then(msg => {
      msg.delete({ timeout: 3000 }); // حذف التأكيد بعد 3 ثواني
    });
  } catch (err) {
    console.error(err);
    message.reply('حدث خطأ أثناء محاولة المسح.');
  }
});

client.on('message', message => {
  if (message.author.bot) return;

  if (message.content.startsWith('+رسالة')) {
    // تحقق من الصلاحية
    if (!message.member.roles.cache.has(staffid)) {
    return message.reply('❌ ليس لديك الصلاحية لاستخدام هذا الامر');
  }

    const args = message.content.split(' ').slice(1); // حذف كلمة +رسالة
    const text = args.join(' '); // دمج الباقي كرسالة

    if (!text) return message.channel.send('❌ الرجاء كتابة رسالة بعد الأمر.');

    // ارسال الرسالة
    message.channel.send(text).then(() => {
      // مسح رسالة العضو بعد الإرسال
      message.delete().catch(() => {});
    });
  }
});
// المساعدة
client.on('message', async message => {
  if (message.content === '+مساعدة') {

    // Embeds لكل قسم
    const helpTickets = new Discord.MessageEmbed()
      .setColor('#00bfff')
      .setTitle('🎫 أوامر التذاكر')
      .setDescription(
        '`+تكت` - فتح تذكرة دعم فني\n' +
        '`+remove` - إزالة شخص من التذكرة\n' +
        '`+add` - إضافة شخص للتذكرة'
      );

    const helpStaff = new Discord.MessageEmbed()
      .setColor('#00bfff')
      .setTitle('⚙️ أوامر الادارة')
      .setDescription(
        '`+مسح [العدد] 🧹` - مسح عدد معين من الرسائل (حتى 100)\n' +
        '`+رسالة [نص] 📤` - إرسال رسالة من البوت\n' +
        '`+tax [amount] 📊` - حساب ضريبة التحويل\n' +
        '`+نداء 👈🏻` - نداء شخص معين بالخاص\n' +
        '`+رول` - اعطاء أو حذف رول\n' +
        '`+اذلف` - طرد شخص\n' +
        '`+قفل 🔒` - قفل الشات\n' +
        '`+فتح 🔓` - فتح الشات\n' +
        '`+اخفاء 👻` - اخفاء الشات\n' +
        '`+اظهار 👻` - اظهار الشات'
      );

    const helpGeneral = new Discord.MessageEmbed()
      .setColor('#00bfff')
      .setTitle('أوامر عامة')
      .setDescription('`+مساعدة ℹ️` - عرض قائمة الأوامر');

    const helpPoints = new Discord.MessageEmbed()
      .setColor('#00bfff')
      .setTitle('أوامر النقاط 📌')
      .setDescription(
        '`+نقاطي` - اظهار عدد النقاط \n' +
        '`+توب` - اظهار ترتيب النقاط \n' +
        '`+زيد` - اضافة نقاط (للمسؤولون عن النقاط) \n' +
        '`+نقص` - حذف نقاط (للمسؤولون عن النقاط) \n' +
        '`+اعادة` - إعادة تعيين نقاط شخص معين (للمسؤولون عن النقاط)'
      );

    const helpGames = new Discord.MessageEmbed()
      .setColor('#00bfff')
      .setTitle('🎰 الألعاب')
      .setDescription('`+spin` - لعبة عجلة الحظ');

    // أزرار لكل قسم
    const btnTickets = new disbut.MessageButton()
      .setStyle('blurple')
      .setLabel('التذاكر 🎫')
      .setID('help_tickets');

    const btnStaff = new disbut.MessageButton()
      .setStyle('green')
      .setLabel('أوامر ادارية ⚙️')
      .setID('help_staff');

    const btnGeneral = new disbut.MessageButton()
      .setStyle('grey')
      .setLabel('عام')
      .setID('help_general');

    const btnGames = new disbut.MessageButton()
      .setStyle('green')
      .setLabel('ألعاب 🎰')
      .setID('help_games');
      
      const btnPoints = new disbut.MessageButton()
      .setStyle('grey')
      .setLabel('أوامر النقاط 📌')
      .setID('help_points');

    const btnClose = new disbut.MessageButton()
      .setStyle('red')
      .setLabel('❌ إغلاق القائمة')
      .setID('help_close');

    // تقسيم الأزرار على صفين (Discord يسمح فقط بـ 1-5 أزرار لكل صف)
    const row1 = new disbut.MessageActionRow()
      .addComponent(btnTickets)
      .addComponent(btnStaff)
      .addComponent(btnGeneral)
      .addComponent(btnGames)
      .addComponent(btnPoints);

    const row2 = new disbut.MessageActionRow()
      .addComponent(btnClose);

    // إرسال الرسالة مع الصفوف
    const helpMsg = await message.channel.send({ embed: helpTickets, components: [row1, row2] });

    // التعامل مع ضغط الأزرار
    const filter = (button) => button.clicker.user.id === message.author.id;
    const collector = helpMsg.createButtonCollector(filter, { time: 60000 });

    collector.on('collect', async b => {
      await b.reply.defer();
      if (b.id === 'help_tickets') helpMsg.edit({ embed: helpTickets });
      if (b.id === 'help_staff') helpMsg.edit({ embed: helpStaff });
      if (b.id === 'help_general') helpMsg.edit({ embed: helpGeneral });
      if (b.id === 'help_games') helpMsg.edit({ embed: helpGames });
      if (b.id === 'help_points') helpMsg.edit({ embed: helpPoints });
      if (b.id === 'help_close') helpMsg.delete();
    });

  }
});

// رول

client.on('message', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('+رول')) return;

  // تحقق من الصلاحية
  if (!message.member.roles.cache.has(staffid)) {
    return message.reply('❌ ليس لديك صلاحية لإعطاء أو حذف الرتب.');
  }

  const args = message.content.split(' ').slice(1);
  if (!args[0] || !message.mentions.members.first()) {
    return message.reply('❌ الرجاء كتابة اسم أو آيدي الرتبة ومنشن الشخص');
  }

  const roleArg = args[0];
  const member = message.mentions.members.first();

  // البحث عن الرتبة بالآيدي أو بالاسم
  let role = message.guild.roles.cache.get(roleArg); // أولاً نحاول بالآيدي
  if (!role) {
    role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleArg.toLowerCase()); // ثم بالاسم
  }

  if (!role) {
    return message.reply('❌ لم أتمكن من العثور على هذه الرتبة.');
  }

  // تحقق: هل رتبة المسؤول أعلى من الرتبة اللي بيعدلها؟
  if (role.position >= message.member.roles.highest.position) {
    return message.reply('❌ لا يمكنك إعطاء أو إزالة رتبة أعلى من رتبتك.');
  }

  try {
    if (member.roles.cache.has(role.id)) {
      // لو عنده الرتبة → نحذفها
      await member.roles.remove(role);
      message.channel.send(`✅ تم حذف الرتبة ${role.name} من ${member}`);
    } else {
      // لو ما عنده الرتبة → نضيفها
      await member.roles.add(role);
      message.channel.send(`✅ تم إضافة الرتبة ${role.name} إلى ${member}`);
    }
  } catch (err) {
    console.error(err);
    message.channel.send('❌ حدث خطأ أثناء تعديل الرتبة.');
  }
});

   

client.login(token)
