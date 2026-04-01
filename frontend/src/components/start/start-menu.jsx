import search from "../../assets/search-icon.png"
import plus from "../../assets/plus-icon.png"

import StartSwitch from "./start-switch"
import List from "../list"

import '../../css/left-block.css'
import '../../css/list.css'

export default function StartMenu({
    title,
    items,
    onAddClick,
    active, 
    setActive,
    onItemClick,
    loading = false,
    error = null,
    emptyMessage = "Вы пока не состоите ни в одной комнате",
}) {

    return (
        <main className="left-block">
            <div className="left-block-header">
                <img src={search} className="left-block-header-btn"></img>
                <p className="medium-text text--light">{title}</p>
                <img src={plus} onClick = {onAddClick} className="left-block-header-btn"></img>
            </div>
            {loading ? (
                <div className="loading-message"><p className="small-text text--average">Загрузка...</p></div>
            ) : error ? (
                <div className="error-message"><p className="small-text text--average">Ошибка: {error}</p></div>
            ) : items.length === 0 ? (
                <div className="empty-message"><p className="small-text text--average">{emptyMessage}</p></div>
            ) : (
                <List
                    items={items}
                    mode="active"
                    color="light"
                    onItemClick={onItemClick}
                />
            )}
            <StartSwitch active={active} setActive={setActive} />
        </main>
    );
}