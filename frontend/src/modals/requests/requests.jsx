import '../../css/list.css'
import '../../css/modals.css'
import { useState, useEffect,  useCallback } from "react";
import close from "../../assets/close.svg"
import RequestsSwitch from './request-switch';
import RequestItem from './request-item';

import { getIncomingRequests, getOutgoingRequests, cancelRequest, acceptRequest, rejectRequest } from '../../api/requests';

export default function Requests({
    isOpen,
    onClose,
    refreshKey = 0,
    onRequestAccepted,
}) {
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
    }, [isOpen, fetchData, refreshKey]);

    const handleCancel = async (id) => {
        try {
            await cancelRequest(id);
            fetchData();
        } catch (err) {
            console.error(err)
            setError('Не удалось отменить запрос');
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptRequest(id);
            fetchData();
            onRequestAccepted?.();
        } catch (err) {
            console.error(err);
            setError('Не удалось принять запрос');
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectRequest(id);
            fetchData();
        } catch (err) {
            console.error(err);
            setError('Не удалось отклонить запрос');
        }
    };

    if (!isOpen) return null;

    const currentItems = active === 'incoming' ? incoming : outgoing;

    return (
        <main className="modal">
            <div className="reguests-modal-content">
                <p className="medium-text text--light">Запросы</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                {loading && <p className="small-text text--average">Загрузка...</p>}
                {error && <p className="small-text text--average">{error}</p>}
                {!loading && currentItems.length === 0 ? (
                    <p className="small-text text--average">
                        {active === 'incoming' ? 'Нет входящих запросов' : 'Нет исходящих запросов'}
                    </p>
                ) : (
                    <ul className="list list--light">
                        {currentItems.map(item => (
                            <RequestItem
                                key={item.id}
                                request={item}
                                isIncoming={active === 'incoming'}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                onCancel={handleCancel}
                            />
                        ))}
                    </ul>
                )}
                <RequestsSwitch 
                    active={active}
                    setActive={setActive}
                />
            </div>
        </main>
    )
}
