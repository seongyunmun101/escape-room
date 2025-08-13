document.addEventListener('DOMContentLoaded', () => {
    // 필요한 모든 DOM 요소 선택
    const clickableAreas = {
        clock: document.getElementById('clock-area'),
        computer: document.getElementById('computer-area'),
        chalkboard: document.getElementById('chalkboard-area'),
        desk: document.getElementById('desk-area'),
        door: document.getElementById('door-area')
    };

    const modals = {
        clock: document.getElementById('clock-modal'),
        computer: document.getElementById('computer-modal'),
        chalkboard: document.getElementById('chalkboard-modal'),
        desk: document.getElementById('desk-modal'),
        door: document.getElementById('door-modal'),
        success: document.getElementById('success-modal')
    };

    const overlay = document.getElementById('overlay');
    const closeButtons = document.querySelectorAll('.close-btn');

    // 모달 열기 함수
    const openModal = (modal) => {
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    };

    // 모달 닫기 함수
    const closeModal = () => {
        for (const key in modals) {
            modals[key].classList.add('hidden');
        }
        overlay.classList.add('hidden');
    };

    // 클릭 영역에 이벤트 리스너 추가
    clickableAreas.clock.addEventListener('click', () => openModal(modals.clock));
    clickableAreas.computer.addEventListener('click', () => openModal(modals.computer));
    clickableAreas.chalkboard.addEventListener('click', () => openModal(modals.chalkboard));
    clickableAreas.desk.addEventListener('click', () => openModal(modals.desk));
    clickableAreas.door.addEventListener('click', () => openModal(modals.door));

    // 닫기 버튼 및 오버레이에 이벤트 리스너 추가
    closeButtons.forEach(button => button.addEventListener('click', closeModal));
    overlay.addEventListener('click', closeModal);

    // --- 각 퀴즈 로직 ---

    // 1. 시계 퀴즈
    document.getElementById('clock-submit').addEventListener('click', () => {
        const answer = document.getElementById('clock-answer').value;
        if (answer.trim() === '시계') {
            document.getElementById('clock-hint').classList.remove('hidden');
        } else {
            alert('틀렸습니다. 다시 생각해보세요.');
        }
    });

    // 2. 컴퓨터 퀴즈
    document.getElementById('computer-submit').addEventListener('click', () => {
        const answer = document.getElementById('computer-answer').value;
        // 'chromakey'는 9글자
        if (parseInt(answer) === 9) {
            document.getElementById('computer-hint').classList.remove('hidden');
        } else {
            alert('틀렸습니다. 영어로 적고 알파벳 개수를 정확히 세어보세요.');
        }
    });
    
    // 3. 칠판 퀴즈
    document.getElementById('chalkboard-submit').addEventListener('click', () => {
        const answer = document.getElementById('chalkboard-answer').value;
        // 스피커 3개, 창문 1개 -> (3 * 1) + 5 = 8
        if (parseInt(answer) === 8) {
            document.getElementById('chalkboard-hint').classList.remove('hidden');
        } else {
            alert('계산이 틀렸습니다. 이미지의 사물을 잘 세어보세요.');
        }
    });

    // 4. 책상 퀴즈
    // --- 총알 피하기 미니게임 ---
    const canvas = document.getElementById('bullet-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('bullet-start');
    const timerSpan = document.getElementById('bullet-timer');
    const resultP = document.getElementById('bullet-result');
    let gameActive = false, gameTimer = 0, timerInterval = null, bullets = [], player = null, keys = {};

    function resetGame() {
        player = { x: 160, y: 280, size: 20, speed: 4 };
        bullets = [];
        for (let i = 0; i < 3; i++) {
            bullets.push({
                x: Math.random() * 300 + 10,
                y: Math.random() * 120 + 10,
                size: 12,
                dx: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random()),
                dy: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random())
            });
        }
        keys = {};
        resultP.classList.add('hidden');
        resultP.textContent = '';
        timerSpan.textContent = '15';
    }

    function drawGame() {
        ctx.clearRect(0, 0, 320, 320);
        // Draw player
        ctx.fillStyle = '#4ef';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        ctx.fill();
        // Draw bullets
        ctx.fillStyle = '#f44';
        bullets.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function updateGame() {
        // Move player
        if (keys['ArrowLeft'] && player.x - player.size > 0) player.x -= player.speed;
        if (keys['ArrowRight'] && player.x + player.size < 320) player.x += player.speed;
        if (keys['ArrowUp'] && player.y - player.size > 0) player.y -= player.speed;
        if (keys['ArrowDown'] && player.y + player.size < 320) player.y += player.speed;
        // Move bullets
        bullets.forEach(b => {
            b.x += b.dx;
            b.y += b.dy;
            if (b.x - b.size < 0 || b.x + b.size > 320) b.dx *= -1;
            if (b.y - b.size < 0 || b.y + b.size > 320) b.dy *= -1;
        });
        // Collision check
        for (let b of bullets) {
            let dist = Math.hypot(player.x - b.x, player.y - b.y);
            if (dist < player.size + b.size) {
                endGame(false);
                return;
            }
        }
        drawGame();
        if (gameActive) requestAnimationFrame(updateGame);
    }

    function startGame() {
        resetGame();
        gameActive = true;
        gameTimer = 15;
        timerSpan.textContent = gameTimer;
        startBtn.disabled = true;
        updateGame();
        timerInterval = setInterval(() => {
            gameTimer--;
            timerSpan.textContent = gameTimer;
            if (gameTimer <= 0) {
                endGame(true);
            }
        }, 1000);
    }

    function endGame(success) {
        gameActive = false;
        clearInterval(timerInterval);
        startBtn.disabled = false;
        if (success) {
            resultP.textContent = '성공! 계속해서 단서를 찾아보세요!';
            resultP.classList.remove('hidden');
        } else {
            resultP.textContent = '실패! 총알에 맞았습니다. 다시 도전하세요.';
            resultP.classList.remove('hidden');
        }
    }

    startBtn.addEventListener('click', () => {
        if (!gameActive) startGame();
    });
    window.addEventListener('keydown', e => { if (gameActive) keys[e.key] = true; });
    window.addEventListener('keyup', e => { if (gameActive) keys[e.key] = false; });
    // 모달 열릴 때마다 게임 리셋
    document.getElementById('desk-area').addEventListener('click', () => {
        resetGame();
        drawGame();
    });

    // 5. 최종 탈출 시도
    document.getElementById('escape-btn').addEventListener('click', () => {
        const password = document.getElementById('password-input').value;
        if (password === '0815') {
            closeModal();
            setTimeout(() => openModal(modals.success), 200); // 약간의 딜레이 후 성공 모달 표시
        } else {
            alert('비밀번호가 틀렸습니다!');
        }
    });
});