// src/components/Background.jsx
import { useEffect } from 'react';
import '../css/background.css';

const Background = () => {
  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 100, density: { enable: true, value_area: 1000 } },
          color: { value: ['#D7D9D8', '#283740', '#5A6B7A'] },
          shape: { type: ['circle', 'triangle', 'polygon'], polygon: { nb_sides: 5 } },
          opacity: { value: 0.6, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1 } },
          size: { value: 4, random: true, anim: { enable: true, speed: 2, size_min: 0.1 } },
          line_linked: { enable: true, distance: 150, color: '#000000', opacity: 0.3, width: 1.5 },
          move: { enable: true, speed: 2, random: true, out_mode: 'out' }
        },
        interactivity: {
          detect_on: 'window',
          events: {
            onhover: { enable: true, mode: 'grab' },

            // ❌ Полностью убираем возможность добавлять частицы кликом
            onclick: { enable: false },

            resize: true
          },
          modes: {
            grab: { distance: 200, line_linked: { opacity: 0.7 } }
          }
        },
        retina_detect: true
      });
    }
  }, []);

  return (
    <div className="background-wrapper">
      <div className="parallax-bg"></div>
      <div id="particles-js"></div>
    </div>
  );
};

export default Background;
