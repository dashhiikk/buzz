import '../../css/list.css'
import '../../css/modals.css'
import { useState, useEffect,  useCallback } from "react";
import close from "../../assets/close-icon.png"
import defaultAvatar from "../../assets/buzz-icon-bee.svg"
import defaultRoomIcon from "../../assets/buzz-icon_mini.png"
import List from '../../components/list'
import RequestsSwitch from './request-switch';

import { getIncomingRequests, getOutgoingRequests, cancelRequest } from '../../api/requests';

export default function Requests({ isOpen, onClose }) {
    const [active, setActive] = useState("incoming");
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (active === 'incoming') {
                const response = await getIncomingRequests();
                setIncoming(Array.isArray(response.data) ? response.data : []);
            } else {
                const response = await getOutgoingRequests();
                setOutgoing(Array.isArray(response.data) ? response.data : []);
            }
        } catch (err) {
            setError(err.message || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    }, [active]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, fetchData]);

    const handleCancel = async (id) => {
        try {
            await cancelRequest(id);
            fetchData();
        } catch (err) {
            console.log(err)
            alert('Не удалось отменить запрос');
        }
    };

    if (!isOpen) return null;

    const currentItems = active === 'incoming' ? incoming : outgoing;
    // Преобразуем данные в нужный для List формат (если нужно)
    const listItems = currentItems.map(item => {
        const isRoom = item.type === 'room';
        // Иконка
        let icon = defaultAvatar;
        if (isRoom) {
            icon = item.roomIcon || defaultRoomIcon;
        } else {
            icon = item.userAvatar || defaultAvatar;
        }
        // Имя пользователя
        const userName = `${item.senderName}#${item.senderCode}`;
        // Текст описания
        let description = '';
        if (isRoom) {
            if (active === 'incoming') {
                description = `${userName} приглашает вас в комнату "${item.roomName}"`;
            } else {
                description = `Вы пригласили ${userName} в комнату "${item.roomName}"`;
            }
        } else {
            if (active === 'incoming') {
                description = `${userName} отправил(а) вам запрос в друзья`;
            } else {
                description = `Вы отправили запрос в друзья ${userName}`;
            }
        }
        return {
            id: item.id,
            name: description,
            icon,
        };
    });

    return (
        <main className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">Запросы</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                {loading && <p className="small-text text--average">Загрузка...</p>}
                {error && <p className="small-text text--average">{error}</p>}
                {listItems.length === 0 ? (
                    <p className="small-text text--average">
                        {active === 'incoming' ? 'Нет входящих запросов' : 'Нет исходящих запросов'}
                    </p>
                ) : (
                    <>
                        {active === 'incoming' && (
                            <List
                                items={listItems}
                                mode="active"
                                color="light"
                            />
                        )}
                        {active === 'outgoing' && (
                            <List
                                items={listItems}
                                mode="active"
                                color="light"
                                showCancelButton
                                onCancel={handleCancel}
                            />
                        )}
                    </>
                )}
                <RequestsSwitch 
                    active={active}
                    setActive={setActive}
                />
            </div>
        </main>
    )
}