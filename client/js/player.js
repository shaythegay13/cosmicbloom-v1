// Player class for Farm & Give
class Player {
    constructor(data) {
        this.id = data.id || data._id;
        this.username = data.username;
        this.email = data.email;
        this.selectedCharacter = data.selectedCharacter;
        this.gameProgress = data.gameProgress || this.getDefaultProgress();
        
        // Position in the world
        this.x = 5;
        this.y = 5;
        this.width = 32;
        this.height = 32;
        
        // Movement
        this.speed = 2;
        this.direction = 'down';
        
        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 10;
    }

    getDefaultProgress() {
        return {
            level: 1,
            coins: 100,
            experience: 0,
            unlockedAreas: ['starter_farm'],
            inventory: [],
            farm: {
                plots: []
            }
        };
    }

    move(dx, dy, world) {
        const newX = this.x + dx * this.speed;
        const newY = this.y + dy * this.speed;

        // Check boundaries
        if (newX >= 0 && newX < world.width - 1 && 
            newY >= 0 && newY < world.height - 1) {
            
            // Check collision
            if (!world.isCollision(Math.floor(newX), Math.floor(newY))) {
                this.x = newX;
                this.y = newY;

                // Update direction
                if (dx > 0) this.direction = 'right';
                else if (dx < 0) this.direction = 'left';
                else if (dy > 0) this.direction = 'down';
                else if (dy < 0) this.direction = 'up';

                return true;
            }
        }
        return false;
    }

    update() {
        // Update animation
        this.animationTimer++;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }

    draw(ctx, camera) {
        const screenX = (this.x - camera.x) * 32;
        const screenY = (this.y - camera.y) * 32;

        // Draw simple character (colored square with emoji)
        const color = this.getCharacterColor();
        ctx.fillStyle = color;
        ctx.fillRect(screenX, screenY, this.width, this.height);

        // Draw character emoji
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            this.getCharacterEmoji(),
            screenX + this.width / 2,
            screenY + this.height / 2
        );
    }

    getCharacterColor() {
        const colors = {
            sunny: '#FFD700',
            luna: '#9370DB',
            terra: '#8B4513',
            river: '#4682B4',
            sage: '#2E8B57'
        };
        return colors[this.selectedCharacter] || '#888888';
    }

    getCharacterEmoji() {
        const emojis = {
            sunny: '☀️',
            luna: '🌙',
            terra: '🌍',
            river: '💧',
            sage: '🧙'
        };
        return emojis[this.selectedCharacter] || '👤';
    }

    addCoins(amount) {
        this.gameProgress.coins += amount;
        ui.updateHUD(this);
    }

    spendCoins(amount) {
        if (this.gameProgress.coins >= amount) {
            this.gameProgress.coins -= amount;
            ui.updateHUD(this);
            return true;
        }
        return false;
    }

    addExperience(amount) {
        this.gameProgress.experience += amount;
        
        // Check for level up
        const expNeeded = this.gameProgress.level * 100;
        if (this.gameProgress.experience >= expNeeded) {
            this.levelUp();
        }
    }

    levelUp() {
        this.gameProgress.level++;
        this.gameProgress.experience = 0;
        ui.updateHUD(this);
        
        // Show level up notification
        console.log(`Level up! Now level ${this.gameProgress.level}`);
    }

    addToInventory(itemId, quantity = 1) {
        const existingItem = this.gameProgress.inventory.find(
            item => item.itemId === itemId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.gameProgress.inventory.push({ itemId, quantity });
        }
    }

    removeFromInventory(itemId, quantity = 1) {
        const item = this.gameProgress.inventory.find(
            i => i.itemId === itemId
        );

        if (item && item.quantity >= quantity) {
            item.quantity -= quantity;
            if (item.quantity === 0) {
                this.gameProgress.inventory = this.gameProgress.inventory.filter(
                    i => i.itemId !== itemId
                );
            }
            return true;
        }
        return false;
    }

    hasItem(itemId, quantity = 1) {
        const item = this.gameProgress.inventory.find(
            i => i.itemId === itemId
        );
        return item && item.quantity >= quantity;
    }

    getProgress() {
        return {
            level: this.gameProgress.level,
            coins: this.gameProgress.coins,
            experience: this.gameProgress.experience,
            inventory: this.gameProgress.inventory,
            farm: this.gameProgress.farm,
            unlockedAreas: this.gameProgress.unlockedAreas
        };
    }
}
