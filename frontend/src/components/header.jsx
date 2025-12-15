import buzziconbee from "../assets/buzz-icon-bee.svg"
import settings from "../assets/settings-icon.svg"
import user from "../assets/user-icon.svg"
import '../css/header.css'

import Settings from "./settings/settings"
import { useState } from "react"

export default function Header() {

  const [openSettings, setOpenSettings] = useState(false)
  const [rotated, setRotated] = useState(false);

  const handleClick = () => {
    setOpenSettings(prev => !prev);
    setRotated(prev => !prev);
  };

  

  return (
    <main className="header">
      <div className="header-content">
        <div className="header-buzz-icon">
          <img src={buzziconbee} ></img>
        </div>
        <h1>buzz</h1>
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