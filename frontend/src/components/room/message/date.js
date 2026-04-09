export function formatMessageTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Если сообщение сегодня – показываем только время
    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Если вчера – "Вчера HH:MM"
    if (diffDays === 1) {
        return `Вчера ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // Если в этом году – "DD.MM HH:MM"
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
    // Иначе полная дата "DD.MM.YY HH:MM"
    return date.toLocaleString([], { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}