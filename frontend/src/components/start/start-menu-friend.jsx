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
        <main className="left-block start-menu">
            <div className="left-block-header">
                <img src={search}></img>
                <p>Друзья</p>
                <img src={plus} onClick = {openModal}></img>
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
            <StartSwitch active={active} setActive={setActive} />
            <AddFriend isOpen={isAddModalOpen} onClose={closeModal}/>
        </main>
    );
}