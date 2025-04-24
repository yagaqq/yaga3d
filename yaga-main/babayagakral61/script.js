
    const difficultySettings = {
      easy: { cols: 8, rows: 8, mineCount: 10 },
      medium: { cols: 10, rows: 10, mineCount: 15 },
      hard: { cols: 12, rows: 12, mineCount: 20 },
    };

    let cols = difficultySettings.medium.cols;
    let rows = difficultySettings.medium.rows;
    let mineCount = difficultySettings.medium.mineCount;

    let gameBoard = [];
    let minePositions = [];
    let revealedCount = 0;
    let started = false;
    let timer = 0;
    let interval;

    const gameEl = document.getElementById('game');
    const modal = document.getElementById('modal');
    const message = document.getElementById('message');
    const timerEl = document.getElementById('time');
    const task1 = document.getElementById('task1');
    const task2 = document.getElementById('task2');
    const difficultyEl = document.getElementById('difficulty');
    const mineCountStat = document.getElementById('mine-count-stat');
    const flagCountStat = document.getElementById('flag-count-stat');
    const remainingFlagsStat = document.getElementById('remaining-flags-stat');
    const gameTimeStat = document.getElementById('game-time-stat');

    //Audios
    const Tralaleo = new Audio('./audio/Tralaleo.mp3')
    Tralaleo.volume = 0.5
    const Lirililaria = new Audio('./audio/Lirililaria.mp3')

    function createBoard() {
      gameBoard = [];
      minePositions = [];
      revealedCount = 0;
      started = false;
      clearInterval(interval);
      timer = 0;
      timerEl.textContent = '0';
      gameEl.innerHTML = '';
      gameEl.style.setProperty('--cols', cols);
      gameEl.style.setProperty('--rows', rows);

      for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
          const tile = document.createElement('div');
          tile.classList.add('tile');
          tile.dataset.x = x;
          tile.dataset.y = y;
          tile.addEventListener('click', handleClick);
          tile.addEventListener('contextmenu', handleRightClick);
          gameEl.appendChild(tile);
          row.push(tile);
        }
        gameBoard.push(row);
      }

      mineCountStat.textContent = mineCount;
      flagCountStat.textContent = 0;
      remainingFlagsStat.textContent = mineCount;
      gameTimeStat.textContent = timer;
    }

    function placeMines(excludeX, excludeY) {
        
      while (minePositions.length < mineCount) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);
        if ((x === excludeX && y === excludeY) || minePositions.some(p => p.x === x && p.y === y)) continue;
        minePositions.push({x, y});
      }
    }

    function handleClick(e) {
      const tile = e.target;
      const x = parseInt(tile.dataset.x);
      const y = parseInt(tile.dataset.y);
      
      const Bombardino = new Audio('./audio/Bombardino.mp3')
      Bombardino.play()

      if (!started) {
        placeMines(x, y);
        started = true;
        interval = setInterval(() => {
          timer++;
          timerEl.textContent = timer;
          gameTimeStat.textContent = timer;
        }, 1000);
      }

      revealTile(x, y);
    }

    function handleRightClick(e) {
      e.preventDefault();
      const tile = e.target;
      if (tile.classList.contains('revealed')) return;
      tile.classList.toggle('flagged');

      
      Tralaleo.play()

      updateFlagCount();
    }


    function updateFlagCount() {
      const flaggedCount = document.querySelectorAll('.tile.flagged').length;
      flagCountStat.textContent = flaggedCount;
      remainingFlagsStat.textContent = mineCount - flaggedCount;
    }

    function revealTile(x, y) {
      const tile = gameBoard[y][x];
      if (tile.classList.contains('revealed') || tile.classList.contains('flagged')) return;

      tile.classList.add('revealed');

      if (minePositions.some(p => p.x === x && p.y === y)) {
        tile.classList.add('mine');
        revealAllMines();  // Mayına basıldığında tüm mayınları göster
        endGame(false);

        return;
      }

      const count = countMinesAround(x, y);
      if (count > 0) {
        tile.textContent = count;
        tile.classList.add('number', `number-${count}`);
      } else {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
              revealTile(nx, ny);
            }
          }
        }
      }

      // Görev kontrolü
      checkTasks();
    }

    function revealAllMines() {
      minePositions.forEach(mine => {
        const tile = gameBoard[mine.y][mine.x];
        tile.classList.add('revealed', 'mine');
      });
    }

    function countMinesAround(x, y) {
      let count = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
            if (minePositions.some(p => p.x === nx && p.y === ny)) {
              count++;
            }
          }
        }
      }
      return count;
    }

    function checkTasks() {
      // Bayraklar tamamsa görev tamamlanmış sayılır
      if (document.querySelectorAll('.tile.flagged').length === mineCount) {
        task1.classList.add('complete');
      }

      // Tüm mayınlar bulunmuşsa
      if (revealedCount === cols * rows - mineCount) {
        task2.classList.add('complete');
      }
    }

    function endGame(won) {
      clearInterval(interval);
      modal.classList.add('show');
      message.textContent = won ? '🎉 Kazandınız!' : '💥 Mayına Bastınız!';
      Lirililaria.play()
    }

    function init() {
      Lirililaria.pause()
      createBoard();
      modal.classList.remove('show');
      task1.classList.remove('complete');
      task2.classList.remove('complete');
    }

    function toggleTheme() {
      document.body.classList.toggle('dark');
    }

    function changeDifficulty() {
      const difficulties = ['easy', 'medium', 'hard'];
      let currentDifficulty = difficulties.indexOf(difficultyEl.textContent.toLowerCase());
      currentDifficulty = (currentDifficulty + 1) % difficulties.length;
      difficultyEl.textContent = difficulties[currentDifficulty][0].toUpperCase() + difficulties[currentDifficulty].slice(1);
      
      cols = difficultySettings[difficulties[currentDifficulty]].cols;
      rows = difficultySettings[difficulties[currentDifficulty]].rows;
      mineCount = difficultySettings[difficulties[currentDifficulty]].mineCount;
      init();
    }

    init();

    





//babayaga61