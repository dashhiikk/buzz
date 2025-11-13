import '../../css/left-block.css'
import '../../css/list.css'
import friend from "../../assets/friend-icon.jpg"
import backward from "../../assets/backward-icon.png"
import room from "../../assets/room-icon.jpg"

export default function RoomMembers() {
    return (
        <main className="left-block">
            <div className="left-block-header">
                <Link to="/start">
                    <img src={backward} className="left-block-header-btn"/>
                </Link>
                <div className="left-block-header-name">
                    <p>Участники</p>
                </div>
                <div className="left-block-header-name">
                    <img src={room}></img>
                </div>
            </div>

            <ul className="start-list">
                <Link to="/friend" className="start-list-element">
                    <img src={friend}></img>
                    <p>Ник друга</p>
                </Link> 
                <Link to="/friend" className="start-list-element">
                    <img src={friend}></img>
                    <p>Ник друга</p>
                </Link> 
                <Link to="/friend" className="start-list-element">
                    <img src={friend}></img>
                    <p>Ник друга</p>
                </Link> 
                <Link to="/friend" className="start-list-element">
                    <img src={friend}></img>
                    <p>Ник друга</p>
                </Link> 
                <Link to="/friend" className="start-list-element">
                    <img src={friend}></img>
                    <p>Ник друга</p>
                </Link> 
            </ul>
        </main>
    )
}