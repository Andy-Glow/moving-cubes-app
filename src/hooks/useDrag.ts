import { useRef } from "react";
import type { Cube } from "../types/cube";

// Описываем параметры, которые наш хук должен получить на вход
interface UseDragProps {
  cubes: Cube[]; // Текущий массив кубиков из стейта
  fieldSize: number; // Размер площадки (800) для лимитов
  setCubes: React.Dispatch<React.SetStateAction<Cube[]>>; // Функция обновления стейта кубиков
  isConnected: boolean; // Флаг: сцеплены ли кубики между собой
  setIsConnected: (connected: boolean) => void; // Функция переключения флага сцепления
}

// Порог в пикселях, при котором кубики "примагничиваются" друг к другу
const SNAP_THRESHOLD = 20;

export function useDrag({ cubes, fieldSize, setCubes, isConnected, setIsConnected }: UseDragProps) {
  // UseRef хранит данные между рендерами, НЕ вызывая перерисовку интерфейса.
  // Нам нужно "втихаря" от React помнить параметры перетаскивания в процессе движения.
  const dragInfo = useRef<{
    cubeId: string; // ID кубика, который мы сейчас тащим
    startX: number; // Координата X курсора мыши на экране в момент нажатия
    startY: number; // Координата Y курсора мыши на экране в момент нажатия
    startCubesPositions: { id: string; x: number; y: number }[]; // Стартовые позиции ВСЕХ кубиков
  } | null>(null);

  // 1. Метод срабатывает, когда пользователь зажимает кнопку мыши на кубике
  const handleMouseDown = (cubeId: string, e: React.MouseEvent) => {
    const currentCube = cubes.find((c) => c.id === cubeId);
    if (!currentCube) return;

    // Запоминаем стартовую позицию мыши и начальные координаты ВСЕХ кубиков.
    dragInfo.current = {
      cubeId,
      startX: e.clientX, // Позиция мыши на экране
      startY: e.clientY,
      startCubesPositions: cubes.map((c) => ({ id: c.id, x: c.x, y: c.y })),
    };

    // Вешаем глобальные слушатели на весь документ.
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 2. Метод срабатывает при каждом сдвиге мыши, пока кнопка зажата
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current) return;

    const { cubeId, startX, startY, startCubesPositions } = dragInfo.current;

    // Вычисляем дельту: на сколько пикселей мышка сместилась от стартовой точки
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Находим стартовую позицию именно того кубика, который тащит пользователь
    const activeStartPos = startCubesPositions.find((p) => p.id === cubeId);
    const activeCube = cubes.find((c) => c.id === cubeId);
    if (!activeStartPos || !activeCube) return;

    // Находим второй (неактивный) кубик
    const otherCube = cubes.find((c) => c.id !== cubeId);
    if (!otherCube) return;

    // Если кубики уже были сцеплены ранее, они двигаются вместе как паровоз
    if (isConnected) {
      setCubes((prevCubes) => {
        let canMove = true;

        // Предварительно рассчитываем новые координаты для обоих кубиков
        const nextCubes = prevCubes.map((cube) => {
          const startPos = startCubesPositions.find((p) => p.id === cube.id);
          if (!startPos) return cube;

          let nextX = startPos.x + deltaX;
          let nextY = startPos.y + deltaY;

          // Проверяем рамки поля 800x800 для каждого кубика в связке.
          if (
            nextX < 0 ||
            nextX > fieldSize - cube.size ||
            nextY < 0 ||
            nextY > fieldSize - cube.size
          ) {
            canMove = false;
          }

          return { ...cube, x: nextX, y: nextY };
        });

        // Если группа не нарушает границы поля, обновляем стейт, иначе оставляем старые позиции
        return canMove ? nextCubes : prevCubes;
      });
      return;
    }

    // ЛОГИКА ДЛЯ ЕЩЕ НЕ СЦЕПЛЕННЫХ КУБИКОВ
    // Рассчитываем положение, куда пользователь хочет сместить кубик мышкой
    let targetX = activeStartPos.x + deltaX;
    let targetY = activeStartPos.y + deltaY;

    // Ограничиваем это движение краями площадки
    if (targetX < 0) targetX = 0;
    if (targetX > fieldSize - activeCube.size) targetX = fieldSize - activeCube.size;
    if (targetY < 0) targetY = 0;
    if (targetY > fieldSize - activeCube.size) targetY = fieldSize - activeCube.size;

    // НАДЁЖНЫЙ АЛГОРИТМ ФИЗИЧЕСКИХ КОЛЛИЗИЙ (Твердые тела)
    const overlapX =
      Math.min(targetX + activeCube.size, otherCube.x + otherCube.size) -
      Math.max(targetX, otherCube.x);
    const overlapY =
      Math.min(targetY + activeCube.size, otherCube.y + otherCube.size) -
      Math.max(targetY, otherCube.y);

    let finalX = targetX;
    let finalY = targetY;

    const isIntersecting = overlapX > 0 && overlapY > 0;

    const isNearLeft =
      Math.abs(targetX + activeCube.size - otherCube.x) < SNAP_THRESHOLD && overlapY > 0;
    const isNearRight =
      Math.abs(targetX - (otherCube.x + otherCube.size)) < SNAP_THRESHOLD && overlapY > 0;
    const isNearTop =
      Math.abs(targetY + activeCube.size - otherCube.y) < SNAP_THRESHOLD && overlapX > 0;
    const isNearBottom =
      Math.abs(targetY - (otherCube.y + otherCube.size)) < SNAP_THRESHOLD && overlapX > 0;

    // Ситуация А: Кубики физически пересеклись
    if (isIntersecting) {
      if (overlapX < overlapY) {
        if (targetX < otherCube.x) finalX = otherCube.x - activeCube.size;
        else finalX = otherCube.x + otherCube.size;
      } else {
        if (targetY < otherCube.y) finalY = otherCube.y - activeCube.size;
        else finalY = otherCube.y + otherCube.size;
      }
    }
    // Ситуация Б: Кубики в зоне "магнитного притяжения"
    else if (isNearLeft || isNearRight || isNearTop || isNearBottom) {
      if (isNearLeft) finalX = otherCube.x - activeCube.size;
      else if (isNearRight) finalX = otherCube.x + otherCube.size;
      else if (isNearTop) finalY = otherCube.y - activeCube.size;
      else if (isNearBottom) finalY = otherCube.y + otherCube.size;
    }

    // Кубик визуально прилипает к грани, но остается свободным, если потянуть обратно.

    setCubes((prevCubes) =>
      prevCubes.map((cube) => (cube.id === cubeId ? { ...cube, x: finalX, y: finalY } : cube)),
    );
  };

  // 3. Метод срабатывает, когда пользователь отпускает кнопку мыши
  const handleMouseUp = () => {
    dragInfo.current = null;

    // УДАЛЯЕМ глобальные слушатели
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // Проверяем текущее положение кубиков в стейте до того, как завершить жест.
    // Если они стоят впритык (зазор равен 0), значит пользователь отпустил мышь именно на магните
    setCubes((currentCubes) => {
      if (isConnected) return currentCubes; // Если они уже соединены, ничего проверять не нужно

      const cube1 = currentCubes[0];
      const cube2 = currentCubes[1];

      // Проверяем стыковку по горизонтали (впритык ребро к ребру)
      const isDockedX = cube1.x + cube1.size === cube2.x || cube2.x + cube2.size === cube1.x;
      const overlapY =
        Math.min(cube1.y + cube1.size, cube2.y + cube2.size) - Math.max(cube1.y, cube2.y) > 0;

      // Проверяем стыковку по вертикали (впритык ребро к ребру)
      const isDockedY = cube1.y + cube1.size === cube2.y || cube2.y + cube2.size === cube1.y;
      const overlapX =
        Math.min(cube1.x + cube1.size, cube2.x + cube2.size) - Math.max(cube1.x, cube2.x) > 0;

      // Если они действительно стоят грань к грани без зазоров — сцепляем их
      if ((isDockedX && overlapY) || (isDockedY && overlapX)) {
        setIsConnected(true);
      }

      return currentCubes; // Метод стейта должен вернуть массив без изменений
    });
  };

  return { handleMouseDown };
}
