export default function Settings() {
    return (
        <main className="settings-block">
            <p className="settings-headder">Настройки</p>
            <img/>
            <div>
                <div>
                    <p>Устройство вывода</p>
                    <div>
                        <p>Выбранное устройство</p>
                        <img/>
                    </div>
                </div>
                <div>
                    <p>Устройство ввода</p>
                    <div>
                        <p>Выбранное устройство</p>
                        <img/>
                    </div>
                </div>
            </div>
            <div>
                <p>Громкость микрофона</p>
                <p>Громкость звука</p>
                <p>Шумоподавление</p>
            </div>
            <div>
                <p>Расширенные настройки</p>
            </div>
        </main>
    );
}