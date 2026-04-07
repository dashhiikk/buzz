import buzziconbee from "../../assets/buzz-icon-bee.svg"
import settings from "../../assets/settings-icon.svg"
import userIcon from "../../assets/user-icon.svg"
import notificationIcon from "../../assets/notification.svg"

import '../../css/header.css'

import Settings from "../settings/settings"
import UserPopup from "./user-popup"
import Requests from "../../modals/requests/requests"

import { useState } from "react"
import { useEffect, useRef } from "react";
import {useAuth} from "../../hooks/use-auth"

export default function Header({ hideIconsAndLogo }) {
  const { user } = useAuth();

  const [openSettings, setOpenSettings] = useState(false)
  const [rotatedSettings, setRotatedSettings] = useState(false);
  const handleClick = () => {
    setOpenSettings(prev => !prev);
    setRotatedSettings(prev => !prev);
  };

  const [openUser, setOpenUser] = useState(false);
  const [rotatedUser, setRotatedUser] = useState(false);
  const handleUserClick = () => {
    setOpenUser(prev => !prev);
    setRotatedUser(prev => !prev);
  };

  const [isRequestsOpen, setIsRequestOpen] = useState(false);
  const openRequestsModal = () => {
      setOpenUser(false);      // закрываем меню
      setIsRequestOpen(true);     // открываем модалку
  };

  const [hasUnread, setHasUnread] = useState(true);
  const [animateRing, setAnimateRing] = useState(true);

  useEffect(() => {
    if (!hasUnread) return;
    let timeoutId;

    const scheduleRing = () => {
        timeoutId = setTimeout(() => {
            setAnimateRing(true);
            setTimeout(() => setAnimateRing(false), 500);
            scheduleRing(); // запускаем следующий через минуту
        }, 2000);
    };

    scheduleRing();
    return () => clearTimeout(timeoutId);
}, [hasUnread]);

  const settingsRef = useRef();
  useEffect(() => {
    const handleClickOutsideSettings = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setOpenSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSettings);
    return () => document.removeEventListener("mousedown", handleClickOutsideSettings);
  }, []);
  const userRef = useRef();
  useEffect(() => {
    const handleClickOutsideUser = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setOpenUser(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideUser);
    return () => document.removeEventListener("mousedown", handleClickOutsideUser);
  }, []);

  return (
    <main className={`header ${hideIconsAndLogo ? "hidden" : ""}`}>
      <div className="header-content">
        <img className="header-buzz-img" src={buzziconbee} ></img>
        <h1 className="buzz">buzz</h1>
        <div className="header-icons">
          <div className="header-wrapper" ref={settingsRef}>
            <img 
              src={settings} 
              alt="settings" 
              className={`header-wrapper-img ${rotatedSettings ? "rotated" : ""}`}
              onClick={handleClick} 
            />
            { openSettings && <Settings/> }
          </div>
          <div className="header-wrapper" ref={userRef}>
            <img 
              src={user?.avatar || userIcon}
              alt="user"
              className={`header-wrapper-img ${rotatedUser ? "rotated" : ""}`}
              onClick={handleUserClick}
            />
            {hasUnread && (
              <div className={`notification ${animateRing ? 'ring' : ''}`}>
                <img src={notificationIcon}/>
              </div>
            )}
            {openUser && <UserPopup onOpenRequests={openRequestsModal}/>}
          </div>
          <Requests 
            isOpen={isRequestsOpen}
            onClose={() => setIsRequestOpen(false)}
          />
        </div>
      </div>
    </main>
  ); 
}