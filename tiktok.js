const { WebcastPushConnection } = require('tiktok-live-connector');

// Создаем новый экземпляр соединения с TikTok Live
let tiktokLiveConnection = new WebcastPushConnection('olesya_stop');

// Обрабатываем события подключения
tiktokLiveConnection.connect().then(state => {
    console.log(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
});

// Обрабатываем события комментариев
tiktokLiveConnection.on('chat', data => {
    console.log(`${data.uniqueId} says: ${data.comment}`);
});

// Обрабатываем события подарков
tiktokLiveConnection.on('gift', data => {
    console.log(`${data.uniqueId} sent a gift: ${data.giftName}`);
});

// Здесь можно добавить другие обработчики событий...
