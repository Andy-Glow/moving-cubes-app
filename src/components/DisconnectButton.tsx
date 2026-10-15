import type { MouseEvent } from "react";

/**
 * Описание пропсов (входных параметров) для компонента DisconnectButton.
 */
interface DisconnectButtonProps {
  isActive: boolean; // Флаг: активна ли кнопка (кубики сцеплены)
  onClick: (e: MouseEvent<HTMLButtonElement>) => void; // Функция-колбэк, вызываемая при клике
}

export default function DisconnectButton({ isActive, onClick }: DisconnectButtonProps) {
  return (
    <button
      className='disconnect-btn'
      disabled={!isActive} // Кнопка блокируется встроенным атрибутом HTML, если кубики не сцеплены
      onClick={onClick} // При клике запускаем функцию разлёта кубиков, переданную от родителя
      // e.stopPropagation() на mouseDown останавливает "всплытие" нажатия мыши.
      // Это гарантирует, что клик по кнопке не долетит до пустого поля Field
      // и не сбросит выделение текущего кубика.
      onMouseDown={(e) => e.stopPropagation()}>
      Разъединить
    </button>
  );
}
