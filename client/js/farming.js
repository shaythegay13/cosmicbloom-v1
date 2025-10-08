// Farming mechanics for Farm & Give
class FarmingSystem {
    constructor(world, player) {
        this.world = world;
        this.player = player;
        this.crops = new Map();
        this.currentTool = 'move';
        
        // Crop definitions
        this.cropTypes = {
            carrot: {
                name: 'Carrot',
                seedId: 'carrot_seeds',
                growthStages: 4,
                growthTime: 30000, // 30 seconds per stage
                sellPrice: 15,
                emoji: ['🌱', '🌿', '🥬', '🥕']
            },
            tomato: {
                name: 'Tomato',
                seedId: 'tomato_seeds',
                growthStages: 4,
                growthTime: 40000,
                sellPrice: 20,
                emoji: ['🌱', '🌿', '🍃', '🍅']
            },
            wheat: {
                name: 'Wheat',
                seedId: 'wheat_seeds',
                growthStages: 3,
                growthTime: 25000,
                sellPrice: 12,
                emoji: ['🌱', '🌾', '🌾']
            },
            corn: {
                name: 'Corn',
                seedId: 'corn_seeds',
                growthStages: 4,
                growthTime: 35000,
                sellPrice: 18,
                emoji: ['🌱', '🌿', '🌽', '🌽']
            }
        };

        this.setupToolbar();
    }

    setupToolbar() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
            });
        });
    }

    handleClick(tileX, tileY) {
        const tile = this.world.getTile(tileX, tileY);
        if (!tile) return;

        switch (this.currentTool) {
            case 'hoe':
                this.tillSoil(tileX, tileY);
                break;
            case 'plant':
                this.plantSeed(tileX, tileY);
                break;
            case 'water':
                this.waterCrop(tileX, tileY);
                break;
            case 'harvest':
                this.harvestCrop(tileX, tileY);
                break;
        }
    }

    tillSoil(x, y) {
        if (this.world.tillSoil(x, y)) {
            console.log('Tilled soil at', x, y);
            this.player.addExperience(1);
        }
    }

    plantSeed(x, y) {
        const tile = this.world.getTile(x, y);
        if (!tile || !tile.tilled || tile.crop) {
            return;
        }

        // Check if player has seeds (for now, just plant carrots)
        const cropType = 'carrot';
        const crop = {
            type: cropType,
            stage: 0,
            plantedAt: Date.now(),
            wateredAt: null,
            needsWater: true
        };

        tile.crop = crop;
        const key = `${x},${y}`;
        this.crops.set(key, crop);

        console.log('Planted', cropType, 'at', x, y);
        this.player.addExperience(2);
    }

    waterCrop(x, y) {
        const tile = this.world.getTile(x, y);
        if (!tile || !tile.crop) {
            return;
        }

        if (tile.crop.needsWater) {
            tile.crop.wateredAt = Date.now();
            tile.crop.needsWater = false;
            
            let experience = 1;
            
            // River: Water efficiency 20% (chance to water adjacent crops)
            if (this.player.selectedCharacter === 'river') {
                // 20% chance to also water adjacent crops
                if (Math.random() < 0.2) {
                    const adjacent = [
                        [x-1, y], [x+1, y], [x, y-1], [x, y+1]
                    ];
                    adjacent.forEach(([ax, ay]) => {
                        const adjTile = this.world.getTile(ax, ay);
                        if (adjTile && adjTile.crop && adjTile.crop.needsWater) {
                            adjTile.crop.wateredAt = Date.now();
                            adjTile.crop.needsWater = false;
                            console.log('River bonus: Also watered crop at', ax, ay);
                        }
                    });
                }
            }
            
            console.log('Watered crop at', x, y);
            this.player.addExperience(experience);
        }
    }

    harvestCrop(x, y) {
        const tile = this.world.getTile(x, y);
        if (!tile || !tile.crop) {
            return;
        }

        const crop = tile.crop;
        const cropDef = this.cropTypes[crop.type];

        // Check if crop is fully grown
        if (crop.stage >= cropDef.growthStages - 1) {
            // Calculate sell price with character bonuses
            let sellPrice = cropDef.sellPrice;
            let experience = 5;
            
            // Luna: Night crops yield double (6 PM to 6 AM)
            const hour = new Date().getHours();
            const isNight = hour >= 18 || hour < 6;
            if (this.player.selectedCharacter === 'luna' && isNight) {
                sellPrice = sellPrice * 2;
                console.log('🌙 Luna night bonus: Double yield!');
            }
            
            // Terra: Soil quality bonus 15% (more coins)
            if (this.player.selectedCharacter === 'terra') {
                sellPrice = Math.floor(sellPrice * 1.15);
            }
            
            // Sage: Experience gain 25%
            if (this.player.selectedCharacter === 'sage') {
                experience = Math.floor(experience * 1.25);
            }
            
            // Harvest the crop
            this.player.addCoins(sellPrice);
            this.player.addExperience(experience);
            
            console.log(`Harvested ${cropDef.name} for ${sellPrice} coins! (+${experience} XP)`);

            // Remove crop
            delete tile.crop;
            const key = `${x},${y}`;
            this.crops.delete(key);
        } else {
            console.log('Crop is not ready to harvest yet');
        }
    }

    update() {
        const now = Date.now();

        this.crops.forEach((crop, key) => {
            const [x, y] = key.split(',').map(Number);
            const cropDef = this.cropTypes[crop.type];

            // Check if crop should grow
            if (!crop.needsWater && crop.wateredAt) {
                const timeSincePlanted = now - crop.plantedAt;
                
                // Apply character bonuses
                let stageTime = cropDef.growthTime;
                
                // Sunny: Crops grow 10% faster
                if (this.player.selectedCharacter === 'sunny') {
                    stageTime = stageTime * 0.9; // 10% faster
                }
                
                const newStage = Math.min(
                    Math.floor(timeSincePlanted / stageTime),
                    cropDef.growthStages - 1
                );

                if (newStage > crop.stage) {
                    crop.stage = newStage;
                    console.log(`Crop at ${x},${y} grew to stage ${newStage}`);
                    
                    // Need water again for next stage
                    if (crop.stage < cropDef.growthStages - 1) {
                        crop.needsWater = true;
                    }
                }
            }
        });
    }

    draw(ctx, camera) {
        this.crops.forEach((crop, key) => {
            const [x, y] = key.split(',').map(Number);
            const cropDef = this.cropTypes[crop.type];
            
            const screenX = (x - camera.x) * 32;
            const screenY = (y - camera.y) * 32;

            // Draw crop emoji
            const emoji = cropDef.emoji[crop.stage] || cropDef.emoji[0];
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, screenX + 16, screenY + 16);

            // Draw water indicator
            if (crop.needsWater) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.fillRect(screenX + 2, screenY + 2, 6, 6);
            }
        });
    }

    getCropAt(x, y) {
        const key = `${x},${y}`;
        return this.crops.get(key);
    }
}
