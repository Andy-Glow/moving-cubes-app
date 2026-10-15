import type { Cube } from "../types/cube";
import CubeElement from "./CubeElement";

/**
 * Описание пропсов для компонента Field.
 */
interface FieldProps {
  size: number; // Фиксированный размер поля (800)
  cubes: Cube[]; // Массив кубиков, которые нужно отрендерить
  selectedCubeId: string | null; // ID выбранного кубика
  onSelectCube: (id: string, e: React.MouseEvent) => void; // Функция для выбора кубика
  onResetSelection: () => void; // Функция для сброса выбора (клик по пустому полю)
  onDragStart: (id: string, e: React.MouseEvent) => void; // Принимаем из App.tsx
}

export default function Field({
  size,
  cubes,
  selectedCubeId,
  onSelectCube,
  onResetSelection,
  onDragStart,
}: FieldProps) {
  return (
    <div
      className='game-field'
      style={{ width: size, height: size }} // Задаем физический размер поля 800x800 пикселей
      onMouseDown={onResetSelection}>
      {/* Проходимся по массиву кубиков и для каждого создаем его визуальный компонент */}
      {cubes.map((cube) => (
        <CubeElement
          key={cube.id}
          cube={cube}
          isSelected={cube.id === selectedCubeId} // Кубик подсветится, если его ID совпадает с выбранным
          onSelect={onSelectCube}
          onDragStart={onDragStart} // Теперь эта переменная успешно передается в кубик
        />
      ))}
    </div>
  );
}
