import virtualBoard from "../../assets/virtual-board.jpg"
import "../../css/room/virtual-board.css"

export default function VirtualBoard() {
    return (
        <>
            <div className="right-block-header">
                <p className="medium-text text--light">Виртуальная доска</p>
            </div>
            <div className="virtual-board">
                <img className="" src = {virtualBoard}/>
            </div>
        </>
    );
}