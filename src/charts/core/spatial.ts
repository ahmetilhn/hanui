/**
 * MEKÂNSAL KOVA — işaretçiye en yakın noktayı her harekette TÜM noktaları taramadan bulur.
 * Noktalar sabit boyutlu piksel hücrelerine dağıtılır; arama yalnızca komşu hücrelerde.
 */

export type SpatialIndex = {
  /** `(x, y)`ye `radius` içindeki en yakın noktanın dizini; yoksa `null`. */
  nearest: (x: number, y: number, radius: number) => number | null;
};

export const spatialIndex = (
  points: readonly { x: number; y: number }[],
  cell = 24,
): SpatialIndex => {
  const buckets = new Map<string, number[]>();
  const key = (column: number, row: number) => `${column}:${row}`;

  points.forEach((point, index) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
    const id = key(Math.floor(point.x / cell), Math.floor(point.y / cell));
    const bucket = buckets.get(id);
    if (bucket) bucket.push(index);
    else buckets.set(id, [index]);
  });

  return {
    nearest: (x, y, radius) => {
      const reach = Math.ceil(radius / cell);
      const column = Math.floor(x / cell);
      const row = Math.floor(y / cell);
      let best: number | null = null;
      let bestDistance = radius * radius;

      for (let dx = -reach; dx <= reach; dx += 1)
        for (let dy = -reach; dy <= reach; dy += 1)
          for (const index of buckets.get(key(column + dx, row + dy)) ?? []) {
            const distance = (points[index].x - x) ** 2 + (points[index].y - y) ** 2;
            if (distance <= bestDistance) {
              bestDistance = distance;
              best = index;
            }
          }

      return best;
    },
  };
};
