import { useLayoutEffect, useRef, useState } from "react";

export default function List({
    items,
    variant = "light", // light | dark
}) {
    const listRef = useRef(null);
    const [canScroll, setCanScroll] = useState(false);

    useLayoutEffect(() => {
        const el = listRef.current;
        if (el) {
            setCanScroll(el.scrollHeight > el.clientHeight);
        }
    }, [items]);

    return (
        <div className="list-wrapper">
            <ul
                ref={listRef}
                className={`list list--${variant}`}
            >
                {items.map(item => (
                    <li
                        key={item.id}
                        className={`list-element list-element--${variant}`}
                    >
                        <div className="list-element-name">
                            <img src={item.avatar} alt="" />
                            <p className="list-element-text">
                                {item.name}
                            </p>
                        </div>

                        {item.status && (
                            <p className="list-element-status">
                                {item.status}
                            </p>
                        )}
                    </li>
                ))}
            </ul>

            {canScroll && (
                <div className={`list-gradient list-gradient--${variant}`} />
            )}
        </div>
    );
}