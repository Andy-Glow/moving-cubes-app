import { useState } from "react";
import type { Cube, CubeColor } from "./types/cube";
import ColorPicker from "./components/ColorPicker";
import Field from "./components/Field";
import DisconnectButton from "./components/DisconnectButton"; // Компонент нашей кнопки
import { useDrag } from "./hooks/useDrag";
import "./styles/main.scss";

const FIELD_SIZE = 800;
const CUBE_SIZE = 80; // Размер кубика, выбранный вами

// Массив базовых цветов, которые будут доступны пользователю для раскраски
export const AVAILABLE_COLORS = ["#a78bfa", "#6ee7b7", "#fcd34d"];

export default function App() {
  // Главный стейт приложения: хранит массив из двух кубиков с их начальными координатами
  const [cubes, setCubes] = useState<Cube[]>([
    { id: "cube-1", x: 150, y: 350, size: CUBE_SIZE, color: AVAILABLE_COLORS[0] }, // Первый кубик (фиолетовый)
    { id: "cube-2", x: 550, y: 350, size: CUBE_SIZE, color: AVAILABLE_COLORS[1] }, // Второй кубик (зеленый)
  ]);

  // Стейт для хранения ID выбранного кубика. Если ничего не выбрано — хранит null.
  const [selectedCubeId, setSelectedCubeId] = useState<string | null>(null);

  // Состояние сцепления кубиков между собой
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Флаг анимации разлёта кубиков
  const [isFlying, setIsFlying] = useState<boolean>(false);

  // Инициализируем хук перетаскивания, передавая параметры сцепления
  const { handleMouseDown } = useDrag({
    cubes,
    fieldSize: FIELD_SIZE,
    setCubes,
    isConnected,
    setIsConnected,
  });

  /**
   * Функция изменения цвета у выбранного кубика.
   */
  const handleColorChange = (color: CubeColor) => {
    if (!selectedCubeId) return; // Защита: если кубик не выбран, ничего не делаем

    setCubes((prevCubes) =>
      prevCubes.map((cube) => (cube.id === selectedCubeId ? { ...cube, color } : cube)),
    );
  };

  /**
   * Функция выбора кубика при клике на него.
   */
  const handleSelectCube = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливает "всплытие" нажатия.
    setSelectedCubeId(id); // Сохраняем ID выбранного кубика в стейт
  };

  /**
   * Разъединение кубиков (Пункт 9 задания)
   */
  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsConnected(false); // Отключаем режим совместного движения кубиков
    setIsFlying(true); // Временно активируем флаг плавной анимации разлёта

    setCubes((prevCubes) =>
      prevCubes.map((cube) => {
        const randomX = Math.floor(Math.random() * (FIELD_SIZE - cube.size));
        const randomY = Math.floor(Math.random() * (FIELD_SIZE - cube.size));

        return {
          ...cube,
          x: randomX,
          y: randomY,
        };
      }),
    );

    // Через 500 миллисекунд отключаем флаг
    setTimeout(() => {
      setIsFlying(false);
    }, 500);
  };

  return (
    <div className='app-container'>
      {/* ИСПРАВЛЕНО: Верхняя панель теперь на весь экран, выстраивает элементы в линию */}
      <header className='controls-panel'>
        {/* Пустой невидимый блок слева для идеальной центровки заголовка по флексу */}
        <div className='panel-spacer'></div>

        {/* Заголовок и подзаголовок по центру */}
        <div className='panel-title'>
          <h2>Управление кубиками</h2>
          <p>Приблизьте кубики друг к другу, чтобы они прилипли</p>
        </div>

        {/* ОБНОВЛЕНО: Блок управления вынесен из поля и прижат к правому краю шапки */}
        <div className='side-controls'>
          <ColorPicker isVisible={selectedCubeId !== null} onSelectColor={handleColorChange} />
          <DisconnectButton isActive={isConnected} onClick={handleDisconnect} />
        </div>
      </header>

      {/* Обертка игрового поля (без плавающих внутренних кнопок) */}
      <div className={`field-wrapper ${isFlying ? "field-flying" : ""}`}>
        {/* Отрисовываем наше игровое поле площадки */}
        <Field
          size={FIELD_SIZE}
          cubes={cubes}
          selectedCubeId={selectedCubeId}
          onSelectCube={handleSelectCube}
          onResetSelection={() => setSelectedCubeId(null)}
          onDragStart={handleMouseDown} // Передаем функцию старта перетаскивания в поле
        />
      </div>
    </div>
  );
}
