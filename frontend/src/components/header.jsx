import buzziconbee from "../assets/buzz-icon-bee.png"
import settings from "../assets/settings-icon.png"
import user from "../assets/user-icon.png"
import '../css/header.css'

export default function Header() {
  return (
      <main className="header">
        <div className="header-content">
            <img src={buzziconbee} className="header-buzz-icon"></img>
            <h1>buzz</h1>
            <div className="header-icons">
                <img src={settings} alt="settings"></img>
                <img src={user} alt="user"></img>
            </div>
        </div>
      </main>
  );
}