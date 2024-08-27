const express = require('express');
const path = require('path');  // Добавьте эту строку для подключения модуля path

const http = require('http');
const WebSocket = require('ws');
const { WebcastPushConnection } = require('tiktok-live-connector');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Настройка TikTok Live Connector
let tiktokLiveConnection = new WebcastPushConnection('odinglas');

let usersActivity = {}; // Объект для хранения активности пользователей
let messageCount = 0;   // Счётчик сообщений

// Стоимость активностей
const MESSAGE_VALUE = 0.001;
const LIKE_VALUE = 0.0005;
const GIFT_VALUE = 1;

// Обрабатываем события подключения
tiktokLiveConnection.connect().then(state => {
    console.log(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
});

// Обрабатываем события комментариев
tiktokLiveConnection.on('chat', data => {
    const userId = data.uniqueId;

    if (!usersActivity[userId]) {
        usersActivity[userId] = {
            avatar: data.profilePictureUrl,
            messages: 0,
            gifts: 0,
            likes: 0,
            totalValue: 0
        };
    }

    usersActivity[userId].messages++;
    usersActivity[userId].totalValue += MESSAGE_VALUE;
    messageCount++;

    // Отправляем обновленную активность пользователя всем клиентам WebSocket
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                userId,
                avatar: usersActivity[userId].avatar,
                activity: usersActivity[userId],
                count: messageCount
            }));
        }
    });
});

// Обрабатываем события подарков
tiktokLiveConnection.on('gift', data => {
    const userId = data.uniqueId;

    if (!usersActivity[userId]) {
        usersActivity[userId] = {
            avatar: data.profilePictureUrl,
            messages: 0,
            gifts: 0,
            likes: 0,
            totalValue: 0
        };
    }

    usersActivity[userId].gifts++;
    usersActivity[userId].totalValue += GIFT_VALUE;
    messageCount++;

    // Отправляем обновленную активность пользователя всем клиентам WebSocket
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                userId,
                avatar: usersActivity[userId].avatar,
                activity: usersActivity[userId],
                count: messageCount
            }));
        }
    });
});

// Обрабатываем события лайков
tiktokLiveConnection.on('like', data => {
    const userId = data.uniqueId;

    if (!usersActivity[userId]) {
        usersActivity[userId] = {
            avatar: data.profilePictureUrl,
            messages: 0,
            gifts: 0,
            likes: 0,
            totalValue: 0
        };
    }

    usersActivity[userId].likes += data.likeCount;
    usersActivity[userId].totalValue += data.likeCount * LIKE_VALUE;
    messageCount++;

    // Отправляем обновленную активность пользователя всем клиентам WebSocket
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                userId,
                avatar: usersActivity[userId].avatar,
                activity: usersActivity[userId],
                count: messageCount
            }));
        }
    });
});



const SUBSCRIPTION_VALUE = 0.5; // Стоимость подписки
const SHARE_VALUE = 0.01; // Стоимость дележки трансляцией

// Пример обработки события подписки (если библиотека поддерживает такое событие)
tiktokLiveConnection.on('subscribe', data => {
    const userId = data.uniqueId;

    if (!usersActivity[userId]) {
        usersActivity[userId] = {
            avatar: data.profilePictureUrl,
            messages: 0,
            gifts: 0,
            likes: 0,
            subscriptions: 0,
            shares: 0,
            totalValue: 0
        };
    }

    usersActivity[userId].subscriptions++;
    usersActivity[userId].totalValue += SUBSCRIPTION_VALUE;

    // Отправляем обновленную активность пользователя всем клиентам WebSocket
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                userId,
                avatar: usersActivity[userId].avatar,
                activity: usersActivity[userId],
                count: messageCount
            }));
        }
    });
});

// Пример обработки события дележки трансляцией (если библиотека поддерживает такое событие)
tiktokLiveConnection.on('share', data => {
    const userId = data.uniqueId;

    if (!usersActivity[userId]) {
        usersActivity[userId] = {
            avatar: data.profilePictureUrl,
            messages: 0,
            gifts: 0,
            likes: 0,
            subscriptions: 0,
            shares: 0,
            totalValue: 0
        };
    }

    usersActivity[userId].shares++;
    usersActivity[userId].totalValue += SHARE_VALUE;

    // Отправляем обновленную активность пользователя всем клиентам WebSocket
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                userId,
                avatar: usersActivity[userId].avatar,
                activity: usersActivity[userId],
                count: messageCount
            }));
        }
    });
});


// Указываем папку, где будут храниться статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Обработка запросов на другие маршруты (если нужно)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Запуск сервера на порту 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
