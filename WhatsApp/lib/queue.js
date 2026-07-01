const queues = new Map();

function joinQueue(userId, listId, maxQuota, dbLists, namaPanggilan, isiData) {
    const timestamp = Date.now();
    if (!queues.has(listId)) queues.set(listId, new Map());

    const listData = dbLists[listId];
    if (!listData) return { success: false, message: "❌ List tidak ditemukan atau sudah ditutup." };
    if (listData.status === 'closed') return { success: false, message: "❌ List ini sudah ditutup oleh Admin." };

    const groupQueue = queues.get(listId);

    if (groupQueue.has(userId)) {
        return { success: false, message: `⚠️ Kamu sudah terdaftar di list ini sebelumnya.` };
    }

    if (groupQueue.size >= maxQuota) {
        return { success: false, message: `❌ Antrean penuh! Kuota maksimal ${maxQuota} orang.` };
    }

    groupQueue.set(userId, { time: timestamp, namaPanggilan, isiData });
    return { success: true, message: `✅ Berhasil! Kamu sukses ngelist di *${listData.nama}*. Cek grup untuk melihat update!` };
}

function getQueueInfo(listId) {
    if (!queues.has(listId)) return [];
    return Array.from(queues.get(listId).entries())
        .map(([userId, data]) => ({ userId, time: data.time, namaPanggilan: data.namaPanggilan, isiData: data.isiData }))
        .sort((a, b) => a.time - b.time);
}

module.exports = { joinQueue, getQueueInfo, queues };