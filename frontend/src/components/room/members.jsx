import '../../css/list.css'
import '../../css/modals.css'

import close from "../../assets/close.svg"
import plus from "../../assets/plus.svg"
import defaultAvatar from "../../assets/user-icon.svg"
import miniDots from "../../assets/dots-mini.svg"

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

import RoomMenu from './room-menu'


export default function RoomMembers({ isOpen, onClose, onOpenInvite, participants, roomAdminId, isAdmin, currentUserId  }) {
    const members = participants.map(p => {
        let status = '';
        if (p.id === roomAdminId && p.id === currentUserId) {
            status = 'Администратор (Вы)';
        } else if (p.id === roomAdminId) {
            status = 'Администратор';
        } else if (p.id === currentUserId) {
            status = 'Вы';
        }
        return {
            id: p.id,
            name: `${p.username}#${p.code}`,
            icon: p.avatar,
            status: status,
        };
    });

    const listRef = useRef(null);

    const [menuState, setMenuState] = useState({
        visible: false,
        memberId: null,
        anchor: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
    });
    const menuRef = useRef(null);
    const triggerRef = useRef(null);

    const handleOpenMenu = (event, memberId) => {
        event.stopPropagation();
        triggerRef.current = event.currentTarget;
        const rect = event.currentTarget.getBoundingClientRect();

        setMenuState((prev) => {
            if (prev.visible && prev.memberId === memberId) {
                return { ...prev, visible: false };
            }

            const anchorX = rect.left + rect.width / 2;
            const anchorY = rect.bottom + 6;

            return {
                visible: true,
                memberId,
                anchor: { x: anchorX, y: anchorY },
                position: { x: anchorX, y: anchorY },
            };
        });
    };
    
    const handleCloseMenu = () => {
        setMenuState((prev) => ({ ...prev, visible: false }));
    };

    useLayoutEffect(() => {
        if (menuState.visible && menuRef.current) {
            const menuRect = menuRef.current.getBoundingClientRect();
            const margin = 8;

            let left = menuState.anchor.x - menuRect.width / 2;
            let top = menuState.anchor.y;

            if (left + menuRect.width > window.innerWidth - margin) {
                left = window.innerWidth - menuRect.width - margin;
            }

            if (top + menuRect.height > window.innerHeight - margin) {
                top = window.innerHeight - menuRect.height - margin;
            }

            if (left < margin) left = margin;
            if (top < margin) top = margin;

            setMenuState((prev) => ({
                ...prev,
                position: { x: left, y: top },
            }));
        }
    }, [menuState.visible, menuState.anchor.x, menuState.anchor.y]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedInsideMenu =
                menuRef.current && menuRef.current.contains(event.target);

            const clickedTrigger =
                triggerRef.current && triggerRef.current.contains(event.target);

            if (!clickedInsideMenu && !clickedTrigger) {
                handleCloseMenu();
            }
        };

        if (menuState.visible) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [menuState.visible]);

    useEffect(() => {
        if (
            menuState.visible &&
            (!isAdmin ||
                menuState.memberId === currentUserId ||
                menuState.memberId === roomAdminId)
        ) {
            handleCloseMenu();
        }
    }, [menuState.visible, menuState.memberId, isAdmin, currentUserId, roomAdminId]);

    if (!isOpen) return null;

    return (
        <main className="modal">
            <div className="modal-content">
                <button className="modal-add-btn" >
                    <img src={plus} onClick={onOpenInvite}></img>
                </button>
                <p className="medium-text text--light">Участники</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                <ul
                    ref={listRef}
                    className={`list list--light`}
                >
                    {members.map(item => {
                        const canManageMember = isAdmin && item.id !== currentUserId && item.id !== roomAdminId;
                        return (
                            <li
                                key={item.id}
                                className={`list-element`}
                            >
                                <div className="list-element-name">
                                    <img src={item.icon || defaultAvatar} alt="" />
                                    <p className={`small-text text--light`}>
                                        {item.name}
                                    </p>
                                </div>
        
                                {item.status && (
                                    <div className="list-status">
                                        <p className={`input-text text--average`}>
                                            {item.status}
                                        </p>
                                    </div>
                                    
                                )}
                                {canManageMember && (
                                    <img
                                        src={miniDots}
                                        className="list-admin-btn"
                                        alt="menu"
                                        onClick={(e) => handleOpenMenu(e, item.id)}
                                    />
                                )}
                            </li>
                        );
                    })}
                </ul>
                {menuState.visible && 
                isAdmin && menuState.memberId !== roomAdminId && 
                menuState.memberId !== currentUserId &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: "fixed",
                            top: menuState.position.y,
                            left: menuState.position.x,
                            zIndex: 9999,
                        }}
                    >
                        <RoomMenu
                            type="member"
                            isAdmin={isAdmin}
                            onCancel={handleCloseMenu}
                        />
                    </div>,
                    document.body
                )}
            </div>
        </main>
    )
}