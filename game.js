class Game {
    constructor() {
      this.player = document.getElementById('player');
      this.gameContainer = document.getElementById('game-container');
      this.scoreElement = document.getElementById('score-value');
      this.floor = document.getElementById('floor');
      
      this.playerY = 310; // Adjusted for new floor height
      this.yVelocity = 0;
      this.rotation = 0;
      this.jumping = false;
      this.gravity = 0.8;
      this.jumpForce = -15;
      this.score = 0;
      
      this.obstacles = [];
      this.gameSpeed = 5;
      this.isGameOver = false;
      this.floorBlocks = [];
  
      this.background = document.getElementById('background');
      this.backgroundX = 0;
      this.backgroundSpeed = 1; // Slower than game speed
  
      this.createFloorBlocks();
      this.bindEvents();
      this.gameLoop();
      this.spawnObstacles();
    }
  
    createFloorBlocks() {
      // Calculate number of blocks needed (add extra to ensure full coverage)
      const blocksNeeded = Math.ceil(800 / 50) + 2; // Added extra block for smooth scrolling
      
      for (let i = 0; i < blocksNeeded; i++) {
        const block = document.createElement('div');
        block.className = 'floor-block';
        block.style.left = `${i * 50}px`; // Position blocks absolutely
        this.floor.appendChild(block);
        this.floorBlocks.push({
          element: block,
          x: i * 50
        });
      }
    }
  
    bindEvents() {
      document.addEventListener('keydown', (e) => {
        if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.jumping) {
          this.jump();
        }
      });
  
      document.addEventListener('click', () => {
        if (!this.jumping) {
          this.jump();
        }
      });
    }
  
    jump() {
      this.jumping = true;
      this.yVelocity = this.jumpForce;
    }
  
    update() {
      if (this.isGameOver) return;
  
      // Update background position
      this.backgroundX -= this.backgroundSpeed;
      if (this.backgroundX <= -800) { // Reset when first image is fully off screen
        this.backgroundX = 0;
      }
      this.background.style.transform = `translateX(${this.backgroundX}px)`;
  
      // Update player position
      this.yVelocity += this.gravity;
      this.playerY += this.yVelocity;
      this.rotation += 5;
  
      // Ground collision - adjusted for new floor height
      if (this.playerY > 310) { // Adjusted for 50px floor height
        this.playerY = 310;
        this.yVelocity = 0;
        this.jumping = false;
        this.rotation = 0;
      }
      if (this.playerY < 20) {
        this.playerY = 20;
        this.yVelocity = 0;
      }
  
      // Update player display
      this.player.style.top = `${this.playerY}px`;
      this.player.style.transform = `rotate(${this.rotation}deg)`;
  
      // Update floor blocks
      this.floorBlocks.forEach((block, index) => {
        block.x -= this.gameSpeed;
        block.element.style.left = `${block.x}px`;
  
        // If block moves off screen, move it to the end
        if (block.x <= -50) {
          // Find the rightmost block's position
          const rightmostX = Math.max(...this.floorBlocks.map(b => b.x));
          // Place this block right after the rightmost block
          block.x = rightmostX + 50;
          block.element.style.left = `${block.x}px`;
        }
      });
  
      // Update obstacles
      this.obstacles.forEach((obstacle, index) => {
        const obstacleElement = obstacle.element;
        obstacle.x -= this.gameSpeed;
        obstacleElement.style.left = `${obstacle.x}px`;
  
        // Remove off-screen obstacles
        if (obstacle.x < -50) {
          obstacleElement.remove();
          this.obstacles.splice(index, 1);
          this.score++;
          this.scoreElement.textContent = this.score;
        }
  
        // Collision detection
        if (this.checkCollision(obstacle)) {
          this.gameOver();
        }
      });
    }
  
    checkCollision(obstacle) {
      const playerRect = this.player.getBoundingClientRect();
      const obstacleRect = obstacle.element.getBoundingClientRect();
  
      // Add some padding to make hitbox slightly more forgiving
      const padding = 5;
      return !(playerRect.right - padding < obstacleRect.left || 
               playerRect.left + padding > obstacleRect.right || 
               playerRect.bottom - padding < obstacleRect.top || 
               playerRect.top + padding > obstacleRect.bottom);
    }
  
    spawnObstacles() {
      if (this.isGameOver) return;
  
      const obstacle = document.createElement('div');
      obstacle.className = 'obstacle';
      
      // No need to set random height anymore since spikes have fixed size
      const height = 40; // Match CSS height
      
      this.gameContainer.appendChild(obstacle);
      this.obstacles.push({
        element: obstacle,
        x: 800,
        height: height
      });
  
      // Spawn next obstacle
      const nextSpawnTime = 1500 + Math.random() * 1000;
      setTimeout(() => this.spawnObstacles(), nextSpawnTime);
    }
  
    gameOver() {
      this.isGameOver = true;
      const gameOverScreen = document.getElementById('game-over-screen');
      const finalScore = document.getElementById('final-score');
      
      gameOverScreen.style.display = 'block';
      finalScore.textContent = this.score;
    }
  
    gameLoop() {
      if (!this.isGameOver) {
        this.update();
        requestAnimationFrame(() => this.gameLoop());
      }
    }
  }
  
  // Start the game
  new Game();