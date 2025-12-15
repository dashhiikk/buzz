import { useState, useRef, useEffect } from "react";
import "../../css/settings.css";

export default function VolumeSlider() {
  const [volume, setVolume] = useState(50);
  const [labelPos, setLabelPos] = useState(0);
  const sliderRef = useRef(null);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setVolume(newValue);
  };

  // вычисляем положение метки
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const rangeWidth = slider.offsetWidth;
    const thumbWidth = 16;
    const availableWidth = rangeWidth - thumbWidth;
    const newLeft = (availableWidth * volume) / 100 + thumbWidth / 2;

    setLabelPos(newLeft);
  }, [volume]);

  return (
    <div className="volume-wrapper">
      <p>0</p>
      <div className="slider-container">
        <input
          ref={sliderRef}
          type="range"
          min="0"
          max="100"
          value={volume}
          onInput={handleChange}
          className="volume-slider"
          style={{
            background: `linear-gradient(to right, #BFB1A4 0%, #BFB1A4 ${volume}%, #283740 ${volume}%, #283740 100%)`
          }}
        />
        <div className="volume-label" style={{ left: `${labelPos}px` }}>
          {volume}
        </div>
      </div>
      <p>100</p>
    </div>
  );
}