import { useState, useEffect } from 'react';
import { getRoom } from '../api/rooms';
import { useAuth } from './use-auth';

export function useRoomAdmin(roomId) {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!roomId || !user) return;
        getRoom(roomId)
            .then(res => {
                setIsAdmin(res.data.adminId === user.id);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [roomId, user]);

    return { isAdmin, loading };
}