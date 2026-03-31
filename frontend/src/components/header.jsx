import buzziconbee from "../assets/buzz-icon-bee.svg"
import settings from "../assets/settings-icon.svg"
import userIcon from "../assets/user-icon.svg"
import '../css/header.css'

import Settings from "./settings/settings"
import UserPopup from "./user-popup"

import { useState } from "react"
import { useEffect, useRef } from "react";
import {useAuth} from "../hooks/use-auth"

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

  const ref = useRef();
  useEffect(() => {
  const handleClickOutside = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setOpenUser(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  return (
    <main className={`header ${hideIconsAndLogo ? "hidden" : ""}`}>
      <div className="header-content">
        <img className="header-buzz-img" src={buzziconbee} ></img>
        <h1 className="buzz">buzz</h1>
        <div className="header-icons">
          <div className="settings-wrapper">
            <img 
              src={settings} 
              alt="settings" 
              className={`${rotatedSettings ? "rotated" : ""}`}
              onClick={handleClick} 
            />
            { openSettings && <Settings/> }
          </div>
          <div className="user-wrapper" ref={ref}>
            <img 
              src={user?.avatar || userIcon}
              alt="user"
              className={`${rotatedUser ? "rotated" : ""}`}
              onClick={handleUserClick}
            />
            {openUser && <UserPopup />}
          </div>
        </div>
      </div>
    </main>
  ); 
}