// World and Map system for Farm & Give
import { TILE_SIZE } from './config.js';

export class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tileSize = TILE_SIZE;
        this.tiles = [];
        this.generateWorld();
    }

    generateWorld() {
        // Generate a simple farm world
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = this.generateTile(x, y);
            }
        }
    }

    generateTile(x, y) {
        // Create borders
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
            return { type: 'fence', walkable: false, color: '#8B4513' };
        }

        // Add some trees randomly
        if (Math.random() < 0.05) {
            return { type: 'tree', walkable: false, color: '#228B22', emoji: '🌲' };
        }

        // Add some rocks
        if (Math.random() < 0.03) {
            return { type: 'rock', walkable: false, color: '#808080', emoji: '🪨' };
        }

        // Default grass
        return { type: 'grass', walkable: true, color: '#8FBC8F', tilled: false };
    }

    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.tiles[Math.floor(y)][Math.floor(x)];
    }

    setTile(x, y, tile) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.tiles[Math.floor(y)][Math.floor(x)] = tile;
        }
    }

    isCollision(x, y) {
        const tile = this.getTile(x, y);
        return tile ? !tile.walkable : true;
    }

    tillSoil(x, y) {
        const tile = this.getTile(x, y);
        if (tile && tile.type === 'grass' && !tile.tilled) {
            tile.tilled = true;
            tile.color = '#654321';
            return true;
        }
        return false;
    }

    draw(ctx, camera) {
        const startX = Math.floor(camera.x);
        const startY = Math.floor(camera.y);
        const endX = Math.min(startX + camera.width + 1, this.width);
        const endY = Math.min(startY + camera.height + 1, this.height);

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.getTile(x, y);
                if (tile) {
                    this.drawTile(ctx, tile, x, y, camera);
                }
            }
        }
    }

    drawTile(ctx, tile, x, y, camera) {
        const screenX = (x - camera.x) * this.tileSize;
        const screenY = (y - camera.y) * this.tileSize;

        // Draw tile background
        ctx.fillStyle = tile.color;
        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

        // Draw tile border for tilled soil
        if (tile.tilled) {
            ctx.strokeStyle = '#4a3319';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
        }

        // Draw emoji if exists
        if (tile.emoji) {
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                tile.emoji,
                screenX + this.tileSize / 2,
                screenY + this.tileSize / 2
            );
        }

        // Draw grid lines (optional, for debugging)
        if (false) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
        }
    }
}

export class Camera {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    follow(target, worldWidth, worldHeight) {
        // Center camera on target
        this.x = target.x - this.width / 2;
        this.y = target.y - this.height / 2;

        // Clamp to world bounds
        this.x = Math.max(0, Math.min(this.x, worldWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, worldHeight - this.height));
    }

    update(viewWidth, viewHeight) {
        this.width = Math.floor(viewWidth / TILE_SIZE);
        this.height = Math.floor(viewHeight / TILE_SIZE);
    }
}
