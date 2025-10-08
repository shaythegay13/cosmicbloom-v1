// Main Game Engine for Farm & Give
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.lastTime = 0;
        
        // Game objects
        this.player = null;
        this.world = null;
        this.camera = null;
        this.farming = null;
        
        // Input
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        
        // Auto-save
        this.saveInterval = 30000; // Save every 30 seconds
        this.lastSave = Date.now();
        
        this.setupCanvas();
        this.setupInput();
    }

    setupCanvas() {
        // Make canvas fill the available space
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight - 120; // Account for HUD
            
            if (this.camera) {
                this.camera.update(this.canvas, this.world);
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
        const tileX = Math.floor(this.camera.x + this.mousePos.x / 32);
        const tileY = Math.floor(this.camera.y + this.mousePos.y / 32);

        this.farming.handleClick(tileX, tileY);
    }

    async init(playerData) {
        // Create player
        this.player = new Player(playerData);
        
        // Create world
        this.world = new World(30, 30);
        
        // Create camera
        this.camera = new Camera(0, 0, 
            Math.floor(this.canvas.width / 32),
            Math.floor(this.canvas.height / 32)
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
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
        const tileX = Math.floor(this.camera.x + this.mousePos.x / 32);
        const tileY = Math.floor(this.camera.y + this.mousePos.y / 32);
        
        const screenX = (tileX - this.camera.x) * 32;
        const screenY = (tileY - this.camera.y) * 32;

        // Draw highlight on hovered tile
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX, screenY, 32, 32);
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

// Create global game instance
let game = null;
