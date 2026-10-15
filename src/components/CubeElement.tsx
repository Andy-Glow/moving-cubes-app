import type { Cube } from "../types/cube";

// Описание пропсов для компонента CubeElement.

interface CubeElementProps {
  cube: Cube; // Объект со всеми данными этого кубика (id, x, y, size, color)
  isSelected: boolean; // Флаг: выбран ли именно этот кубик в данный момент
  onSelect: (id: string, e: React.MouseEvent) => void; // Функция-колбэк для выделения кубика
  onDragStart: (id: string, e: React.MouseEvent) => void; // Функция-колбэк связанная со стартом перетаскивания кубика
}

export default function CubeElement({ cube, isSelected, onSelect, onDragStart }: CubeElementProps) {
  return (
    <div
      /* Если кубик выбран, добавляем класс 'is-selected', который включает пунктирную рамку в CSS */
      className={`cube ${isSelected ? "is-selected" : ""}`}
      style={{
        width: cube.size, // Задаем ширину кубика
        height: cube.size, // Задаем высоту кубика

        // Смещение кубика по осям X и Y. Использование translate намного быстрее и
        // производительнее для браузера, чем использование свойств top и left,
        // так как оно переносит анимации на видеокарту (GPU).
        transform: `translate(${cube.x}px, ${cube.y}px)`,
        backgroundColor: cube.color, // Применяем текущий цвет кубика
      }}
      // Cобытие срабатывает сразу в момент нажатия кнопки (до того, как её отпустили).
      onMouseDown={(e) => {
        onSelect(cube.id, e); // Выделяем кубик кликом
        onDragStart(cube.id, e); // Запускаем логику перетаскивания из хука
      }}
    />
  );
}
