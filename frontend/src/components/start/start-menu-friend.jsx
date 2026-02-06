import search from "../../assets/search-icon.png"
import plus from "../../assets/plus-icon.png"
import friend from "../../assets/friend-icon.jpg"

import AddFriend from "../../modals/add-friend"
import StartSwitch from "./start-switch"

import {Link} from 'react-router-dom'
import { useState } from "react"

import '../../css/left-block.css'
import '../../css/list.css'

export default function StartListFriend({ active, setActive }) {

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const openModal = () => setIsAddModalOpen(true);
    const closeModal = () => setIsAddModalOpen(false);

    return (
        <main className="left-block">
            <div className="left-block-header">
                <img src={search} className="left-block-header-btn"></img>
                <p className="medium-text text--light">Друзья</p>
                <img src={plus} onClick = {openModal} className="left-block-header-btn"></img>
            </div>
            <ul className="list">
                <Link to="/friend" className="list-element">
                    <div className='list-element-name'>
                        <img src={friend}></img>
                        <p className="small-text text--light">Ник друга</p>
                    </div>
                </Link>  
                <Link to="/friend" className="list-element">
                    <div className='list-element-name'>
                        <img src={friend}></img>
                        <p className="small-text text--light">Ник друга</p>
                    </div>
                </Link>  
                <Link to="/friend" className="list-element">
                    <div className='list-element-name'>
                        <img src={friend}></img>
                        <p className="small-text text--light">Ник друга</p>
                    </div>
                </Link>   
                <Link to="/friend" className="list-element">
                    <div className='list-element-name'>
                        <img src={friend}></img>
                        <p className="small-text text--light">Ник друга</p>
                    </div>
                </Link>   
                <Link to="/friend" className="list-element">
                    <div className='list-element-name'>
                        <img src={friend}></img>
                        <p className="small-text text--light">Ник друга</p>
                    </div>
                </Link>  
            </ul>
            <StartSwitch active={active} setActive={setActive} />
            <AddFriend isOpen={isAddModalOpen} onClose={closeModal}/>
        </main>
    );
}