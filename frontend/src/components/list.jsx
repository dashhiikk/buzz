import { useRef} from "react";
import '../css/list.css'

export default function List({
    items,
    mode = "active",
    color = "light",
    onItemClick,
}) {

    const listRef = useRef(null);

    return (
        <>
            <ul
                ref={listRef}
                className={`list list--${color}`}
            >
                {items.map(item => (
                    <li
                        key={item.id}
                        className={`list-element list-element--${mode}`}
                        onClick={() => {
                            if (mode === "active") {
                                onItemClick?.(item);
                            }
                        }}
                    >
                        <div className="list-element-name">
                            <img src={item.avatar} alt="" />
                            <p className={`small-text text--${color}`}>
                                {item.name}
                            </p>
                        </div>

                        {item.status && (
                            <p className={`input-text text--${color}`}>
                                {item.status}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
}