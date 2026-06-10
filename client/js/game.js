// Main Game Engine for Farm & Give
import {
    TILE_SIZE,
    WORLD_WIDTH,
    WORLD_HEIGHT,
    AUTO_SAVE_INTERVAL_MS,
    MAX_DEVICE_PIXEL_RATIO
} from './config.js';
import { api } from './api.js';
import { ui } from './ui.js';
import { Player } from './player.js';
import { World, Camera } from './world.js';
import { FarmingSystem } from './farming.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.lastTime = 0;

        // Logical (CSS pixel) viewport size; the backing store is scaled
        // by devicePixelRatio for crisp rendering on retina screens.
        this.viewWidth = 0;
        this.viewHeight = 0;

        // Game objects
        this.player = null;
        this.world = null;
        this.camera = null;
        this.farming = null;

        // Input
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };

        // Auto-save
        this.saveInterval = AUTO_SAVE_INTERVAL_MS;
        this.lastSave = Date.now();

        this.setupCanvas();
        this.setupInput();
    }

    setupCanvas() {
        // CSS flexbox controls the canvas's displayed size; here we match
        // the backing store to it (scaled by dpr) so drawing isn't stretched.
        const resizeCanvas = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
            this.viewWidth = this.canvas.clientWidth;
            this.viewHeight = this.canvas.clientHeight;
            this.canvas.width = Math.round(this.viewWidth * dpr);
            this.canvas.height = Math.round(this.viewHeight * dpr);
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            if (this.camera) {
                this.camera.update(this.viewWidth, this.viewHeight);
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    setupInput() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Prevent arrow key scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Mouse input
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        // Touch support for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = touch.clientX - rect.left;
            this.mousePos.y = touch.clientY - rect.top;
            this.handleClick(e);
        });
    }

    handleClick(e) {
        if (!this.farming) return;

        // Convert screen coordinates to world coordinates
        const tileX = Math.floor(this.camera.x + this.mousePos.x / TILE_SIZE);
        const tileY = Math.floor(this.camera.y + this.mousePos.y / TILE_SIZE);

        this.farming.handleClick(tileX, tileY);
    }

    async init(playerData) {
        // Create player
        this.player = new Player(playerData);
        
        // Create world
        this.world = new World(WORLD_WIDTH, WORLD_HEIGHT);

        // Create camera
        this.camera = new Camera(0, 0,
            Math.floor(this.viewWidth / TILE_SIZE),
            Math.floor(this.viewHeight / TILE_SIZE)
        );
        
        // Create farming system
        this.farming = new FarmingSystem(this.world, this.player);
        
        // Load saved farm state
        if (this.player.gameProgress.farm.plots) {
            this.loadFarmState();
        }
        
        // Update HUD
        ui.updateHUD(this.player);
        
        console.log('Game initialized');
    }

    loadFarmState() {
        // Restore crops from saved state
        this.player.gameProgress.farm.plots.forEach(plot => {
            const tile = this.world.getTile(plot.x, plot.y);
            if (tile && tile.type === 'grass') {
                tile.tilled = true;
                tile.color = '#654321';
                
                if (plot.crop) {
                    tile.crop = {
                        type: plot.crop,
                        stage: plot.stage || 0,
                        plantedAt: new Date(plot.plantedAt).getTime(),
                        wateredAt: plot.wateredAt ? new Date(plot.wateredAt).getTime() : null,
                        needsWater: !plot.wateredAt
                    };
                    
                    const key = `${plot.x},${plot.y}`;
                    this.farming.crops.set(key, tile.crop);
                }
            }
        });
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    stop() {
        this.running = false;
    }

    gameLoop(currentTime = 0) {
        if (!this.running) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Handle player movement
        let moved = false;
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            moved = this.player.move(0, -1, this.world);
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            moved = this.player.move(0, 1, this.world);
        }
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            moved = this.player.move(-1, 0, this.world);
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            moved = this.player.move(1, 0, this.world);
        }

        // Update player animation
        this.player.update();

        // Update camera to follow player
        this.camera.follow(this.player, this.world.width, this.world.height);

        // Update farming system
        this.farming.update();

        // Auto-save
        const now = Date.now();
        if (now - this.lastSave >= this.saveInterval) {
            this.autoSave();
            this.lastSave = now;
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

        // Draw world
        this.world.draw(this.ctx, this.camera);

        // Draw crops
        this.farming.draw(this.ctx, this.camera);

        // Draw player
        this.player.draw(this.ctx, this.camera);

        // Draw cursor indicator for current tool
        this.drawCursor();
    }

    drawCursor() {
        const tileX = Math.floor(this.camera.x + this.mousePos.x / TILE_SIZE);
        const tileY = Math.floor(this.camera.y + this.mousePos.y / TILE_SIZE);

        const screenX = (tileX - this.camera.x) * TILE_SIZE;
        const screenY = (tileY - this.camera.y) * TILE_SIZE;

        // Draw highlight on hovered tile
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
    }

    async autoSave() {
        try {
            await this.saveGame();
            console.log('Game auto-saved');
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    async saveGame() {
        // Collect farm state
        const plots = [];
        this.farming.crops.forEach((crop, key) => {
            const [x, y] = key.split(',').map(Number);
            plots.push({
                x,
                y,
                crop: crop.type,
                plantedAt: new Date(crop.plantedAt),
                wateredAt: crop.wateredAt ? new Date(crop.wateredAt) : null,
                stage: crop.stage
            });
        });

        // Also save tilled but empty plots
        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                const tile = this.world.getTile(x, y);
                if (tile && tile.tilled && !tile.crop) {
                    plots.push({ x, y, crop: null });
                }
            }
        }

        this.player.gameProgress.farm.plots = plots;

        // Save to server
        await api.saveGame(this.player.getProgress());
    }

    async loadGame() {
        try {
            const data = await api.loadGame();
            if (data.gameProgress) {
                this.player.gameProgress = data.gameProgress;
                this.loadFarmState();
                ui.updateHUD(this.player);
            }
        } catch (error) {
            console.error('Failed to load game:', error);
        }
    }
}
