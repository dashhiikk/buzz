import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getPinnedMessage, unpinMessage } from "../api/rooms";

export default function usePinnedMessage({ roomId, chatRef }) {
    const [pinnedMessage, setPinnedMessage] = useState(null);
    const [showPinnedGradient, setShowPinnedGradient] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);

    const pinnedTextRef = useRef(null);
    const pinnedMenuRef = useRef(null);
    const pinnedLongPressTimer = useRef(null);
    const pinnedLongPressTriggered = useRef(false);

    const [pinnedMenu, setPinnedMenu] = useState({
        visible: false,
        anchor: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
    });

    const calculatePinnedMenuPosition = useCallback((clientX, clientY, menuRect) => {
        const menuWidth = menuRect?.width || 150;
        const menuHeight = menuRect?.height || 100;
        const margin = 8;

        let left = clientX - menuWidth / 2;
        let top = clientY + margin;

        if (top + menuHeight > window.innerHeight - margin) {
            top = clientY - menuHeight - margin;
        }
        if (left < margin) left = margin;
        if (left + menuWidth > window.innerWidth - margin) {
            left = window.innerWidth - menuWidth - margin;
        }
        if (top < margin) top = margin;
        if (top + menuHeight > window.innerHeight - margin) {
            top = window.innerHeight - menuHeight - margin;
        }

        return { x: left, y: top };
    }, []);

    const handleOpenPinnedMenu = useCallback((event) => {
        if (!pinnedMessage) return;

        let clientX;
        let clientY;

        if (event.touches) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        setPinnedMenu({
            visible: true,
            anchor: { x: clientX, y: clientY },
            position: { x: clientX, y: clientY },
        });
    }, [pinnedMessage]);

    const handleClosePinnedMenu = useCallback(() => {
        setPinnedMenu((prev) => ({ ...prev, visible: false }));
    }, []);

    const handleUnpin = useCallback(async () => {
        if (!pinnedMessage) return;

        try {
            await unpinMessage(roomId);
            handleClosePinnedMenu();
        } catch (err) {
            console.error("Failed to unpin message:", err);
            alert("Не удалось открепить сообщение");
        }
    }, [pinnedMessage, roomId, handleClosePinnedMenu]);

    const openPinnedMessageInHistory = useCallback(() => {
        if (!pinnedMessage?.id || !chatRef.current) return;

        const messageElement = chatRef.current.querySelector(
            `[data-message-id="${pinnedMessage.id}"]`
        );

        if (!messageElement) return;

        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedMessageId(pinnedMessage.id);

        setTimeout(() => {
            setHighlightedMessageId(null);
        }, 2000);
    }, [pinnedMessage, chatRef]);

    const checkPinnedOverflow = useCallback(() => {
        const el = pinnedTextRef.current;

        if (!el) {
            setShowPinnedGradient(false);
            return;
        }

        setShowPinnedGradient(el.scrollHeight > el.clientHeight);
    }, []);

    useEffect(() => {
        const fetchPinned = async () => {
            try {
                const res = await getPinnedMessage(roomId);
                setPinnedMessage(res.data);
            } catch (err) {
                console.error("Failed to get pinned message:", err);
            }
        };

        fetchPinned();
    }, [roomId]);

    useLayoutEffect(() => {
        if (pinnedMenu.visible && pinnedMenuRef.current) {
            const rect = pinnedMenuRef.current.getBoundingClientRect();
            const { x, y } = calculatePinnedMenuPosition(
                pinnedMenu.anchor.x,
                pinnedMenu.anchor.y,
                rect
            );

            setPinnedMenu((prev) => ({ ...prev, position: { x, y } }));
        }
    }, [pinnedMenu.visible, pinnedMenu.anchor.x, pinnedMenu.anchor.y, calculatePinnedMenuPosition]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pinnedMenuRef.current && !pinnedMenuRef.current.contains(event.target)) {
                handleClosePinnedMenu();
            }
        };

        if (pinnedMenu.visible) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [pinnedMenu.visible, handleClosePinnedMenu]);

    useLayoutEffect(() => {
        checkPinnedOverflow();
    }, [pinnedMessage, checkPinnedOverflow]);

    useEffect(() => {
        window.addEventListener("resize", checkPinnedOverflow);
        return () => window.removeEventListener("resize", checkPinnedOverflow);
    }, [checkPinnedOverflow]);

    const handlePinnedFromSocket = useCallback((message) => {
        setPinnedMessage(message);
    }, []);

    const handleUnpinnedFromSocket = useCallback(() => {
        setPinnedMessage(null);
    }, []);

    const handleDeletedFromSocket = useCallback((messageId) => {
        setPinnedMessage((prev) => (prev?.id === messageId ? null : prev));
    }, []);

    return {
        pinnedMessage,
        setPinnedMessage,
        showPinnedGradient,
        highlightedMessageId,
        pinnedTextRef,
        pinnedMenuRef,
        pinnedLongPressTimer,
        pinnedLongPressTriggered,
        pinnedMenu,
        handleOpenPinnedMenu,
        handleClosePinnedMenu,
        handleUnpin,
        openPinnedMessageInHistory,
        handlePinnedFromSocket,
        handleUnpinnedFromSocket,
        handleDeletedFromSocket,
    };
}