import '../../css/left-block.css'
import '../../css/list.css'
import friend from "../../assets/friend-icon.jpg"
import backward from "../../assets/backward-icon.png"
import room from "../../assets/room-icon.jpg"

import RoomSwitch from './room-switch'

import {Link} from "react-router-dom"

export default function RoomMembers({ active, setActive }) {
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

            <ul className="list">
                <Link to="/friend" className="list-element">
                    <div className='list-element-name'>
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </div>
                    <p className='list-element-status'>Администратор</p>
                </Link> 
                <Link to="/friend" className="list-element">
                    <div className='list-element-name'>
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </div>
                    <p className='list-element-status'>Я</p>
                </Link> 
                <Link to="/friend" className="list-element">
                    <div className='list-element-name'>
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </div>
                </Link>  
                <Link to="/friend" className="list-element">
                    <div className='list-element-name'>
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </div>
                </Link> 
                <Link to="/friend" className="list-element">
                    <div className='list-element-name'>
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </div>
                </Link> 
            </ul>
            <RoomSwitch active={active} setActive={setActive}/>
        </main>
    )
}