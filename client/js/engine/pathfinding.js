// Breadth-first shortest path on the tile grid (worlds are small, <= 30x30).
// Returns an array of {x, y} steps excluding the start tile, or null.
export function findPath(world, sx, sy, tx, ty, maxLen = 400) {
    sx = Math.round(sx); sy = Math.round(sy);
    tx = Math.round(tx); ty = Math.round(ty);
    if (sx === tx && sy === ty) return [];
    if (!world.isWalkable(tx, ty)) return null;

    const w = world.width, h = world.height;
    const prev = new Int32Array(w * h).fill(-1);
    const visited = new Uint8Array(w * h);
    const queue = [sy * w + sx];
    visited[sy * w + sx] = 1;
    const target = ty * w + tx;
    let found = false;

    for (let qi = 0; qi < queue.length && qi < maxLen * 4; qi++) {
        const cur = queue[qi];
        if (cur === target) { found = true; break; }
        const cx = cur % w, cy = (cur / w) | 0;
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const ni = ny * w + nx;
            if (visited[ni] || !world.isWalkable(nx, ny)) continue;
            visited[ni] = 1;
            prev[ni] = cur;
            queue.push(ni);
        }
    }
    if (!found && prev[target] === -1) return null;

    const path = [];
    let cur = target;
    while (cur !== sy * w + sx && cur !== -1) {
        path.push({ x: cur % w, y: (cur / w) | 0 });
        cur = prev[cur];
    }
    path.reverse();
    return path;
}

// Nearest walkable tile adjacent to (tx, ty) reachable from (sx, sy)
export function adjacentTarget(world, sx, sy, tx, ty) {
    let best = null;
    for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
        const ax = tx + dx, ay = ty + dy;
        if (!world.isWalkable(ax, ay)) continue;
        const path = findPath(world, sx, sy, ax, ay);
        if (path && (!best || path.length < best.path.length)) {
            best = { x: ax, y: ay, path };
        }
    }
    return best;
}
