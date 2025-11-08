import copy from "../../assets/copy-icon.png"

export default function PinnedMessage() {
    return (
        <main className="pinned-message">
            <div className="left-block-header">
                <p>Закрепленное сообщение</p>
                <img src={copy}></img>
            </div>
            <p className="pinned-message-text">
                Археологи установили, что 
                монеты были отчеканены во времена короля Кнута Эрикссона, 
                правившего Швецией во второй половине XII века. На них 
                можно различить надпись KANUTUS. По словам экспертов, 
                клад был зарыт примерно в XII веке, то есть задолго до 
                основания самого Стокгольма, который появился лишь в 1252 году.
            </p>
        </main>
    )
}