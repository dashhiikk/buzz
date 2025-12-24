import buzziconbee from "../assets/buzz-icon-bee.svg"
import settings from "../assets/settings-icon.svg"
import user from "../assets/user-icon.svg"
import '../css/header.css'

import Settings from "./settings/settings"
import { useState } from "react"

export default function Header({ hideIconsAndLogo }) {

  const [openSettings, setOpenSettings] = useState(false)
  const [rotated, setRotated] = useState(false);

  const handleClick = () => {
    setOpenSettings(prev => !prev);
    setRotated(prev => !prev);
  };

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
              className={`settings-icon ${rotated ? "rotated" : ""}`}
              onClick={handleClick}
            />
            { openSettings && <Settings/> }
          </div>
          <img src={user} alt="user"></img>
        </div>
      </div>
    </main>
  ); 
}