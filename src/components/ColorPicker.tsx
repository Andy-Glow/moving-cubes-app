import type { CubeColor } from "../types/cube";
import { AVAILABLE_COLORS } from "../App";

// Описание пропсов для компонента ColorPicker.

interface ColorPickerProps {
  isVisible: boolean; // Флаг: показывать панель цветов или скрыть её
  onSelectColor: (color: CubeColor) => void; // Функция-колбэк, вызываемая при клике на цвет
}

export default function ColorPicker({ isVisible, onSelectColor }: ColorPickerProps) {
  return (
    /* Динамически добавляем класс 'is-active', если иконка должна быть видима */
    <div className={`color-picker ${isVisible ? "is-active" : ""}`}>
      <span>Выбрать цвет:</span>
      <div className='colors-list'>
        {/* Перебираем массив доступных цветов и для каждого создаем круглую кнопку */}
        {AVAILABLE_COLORS.map((color) => (
          <button
            key={color} // Уникальный ключ для React, чтобы он не перерисовывал весь список при изменении одного элемента
            className='color-badge'
            style={{ backgroundColor: color }} // Задаем цвет фона кнопки прямо из массива
            onClick={() => onSelectColor(color)} // При клике передаем выбранный цвет в родительский компонент
            title={`Выбрать цвет ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
