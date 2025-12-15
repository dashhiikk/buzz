// src/components/Background.jsx
import { useEffect } from 'react';
import '../css/background.css';

const Background = () => {
  useEffect(() => {
    const initialCount = 100; // Начальное количество частиц
    const maxAdded = 50; // Максимум добавленных частиц (10 кликов * 5)
    let handleClick = null;

    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: initialCount, density: { enable: true, value_area: 1000 } },
          color: { value: ['#D7D9D8', '#283740', '#5A6B7A'] },
          shape: { type: ['circle', 'triangle', 'polygon'], polygon: { nb_sides: 5 } },
          opacity: { value: 0.6, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1 } },
          size: { value: 4, random: true, anim: { enable: true, speed: 2, size_min: 0.1 } },
          line_linked: { enable: true, distance: 150, color: '#000000', opacity: 0.3, width: 1.5 },
          move: { enable: true, speed: 2, direction: 'none', random: true, straight: false, out_mode: 'out', attract: { enable: true, rotateX: 600, rotateY: 1200 } }
        },
        interactivity: {
          detect_on: 'window',
          events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
          modes: { grab: { distance: 200, line_linked: { opacity: 0.7 } }, bubble: { distance: 300, size: 50, duration: 2, opacity: 0.8 }, repulse: { distance: 150, duration: 0.4 }, push: { particles_nb: 5 }, remove: { particles_nb: 3 } }
        },
        retina_detect: true
      }, function() {
        const pJS = window.pJSDOM[0].pJS;

        handleClick = () => {
          // Проверяем после небольшой задержки
          setTimeout(() => {
            const currentLength = pJS.particles.array.length;
            const added = currentLength - initialCount;
            console.log('Current added particles:', added); // Для отладки

            if (added > maxAdded) {
              const toRemove = added - maxAdded;
              pJS.particles.array.splice(initialCount, toRemove);
              pJS.fn.particlesRefresh(); // Обновляем частицы после удаления
              console.log('Removed old particles:', toRemove); // Отладка
            }
          }, 100); // 100ms задержки для синхронизации
        };

        window.addEventListener('click', handleClick);
      });
    }

    // Cleanup
    return () => {
      if (handleClick) {
        window.removeEventListener('click', handleClick);
      }
    };
  }, []);

  return (
    <div className="background-wrapper">
      {/* <div className="bg-layer bg-stars"></div> */}
      <div className="parallax-bg"></div>
      <div id="particles-js"></div>
    </div>
  );
};

export default Background;