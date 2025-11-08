import buzziconbee from "../assets/buzz-icon-bee.svg"
import settings from "../assets/settings-icon.svg"
import user from "../assets/user-icon.svg"
import '../css/header.css'

export default function Header() {
  return (
      <main className="header">
        <div className="header-content">
            <div className="header-buzz-icon">
              <img src={buzziconbee} ></img>
            </div>
            <h1>buzz</h1>
            <div className="header-icons">
                <img src={settings} alt="settings"></img>
                <img src={user} alt="user"></img>
            </div>
        </div>
      </main>
  );
}