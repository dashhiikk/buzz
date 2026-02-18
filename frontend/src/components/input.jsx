import "../css/input.css";
import { useEffect, useRef } from "react";

export default function Input({ placeholder, type = "text", autoComplete = "off", name }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fixAutofillFont = () => {
      el.readOnly = true;
      el.focus({ preventScroll: true });
      el.blur();
      el.readOnly = false;
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        // ждём, пока Chrome применит autofill-слой
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(fixAutofillFont, 0);
          });
        });
      });
    }
  }, []);

  return (
    <div className="input">
      <input
        ref={ref}
        type={type}
        name={name}
        className="input-text text--dark"
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </div>
  );
}
