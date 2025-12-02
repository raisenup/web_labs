
document.addEventListener("DOMContentLoaded", () => {
    // Елементи DOM
    const playBtn = document.getElementById("playBtn");
    const workOverlay = document.getElementById("work");
    const animArea = document.getElementById("anim");
    const closeBtn = document.getElementById("closeBtn");
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const reloadBtn = document.getElementById("reloadBtn");
    const msgLog = document.getElementById("msgLog");
    const resultsTable = document.getElementById("resultsTableContainer");
    const resultsBody = document.getElementById("resultsBody");

    // Параметри анімації
    let animationId;
    let eventCounter = 1;
    let balls = [];
    const diameter = 20; // 2 * radius (10px)
    let isRunning = false;
    
    // === 1. ФУНКЦІЯ ЛОГУВАННЯ (Тут була можлива помилка) ===
    function logEvent(message) {
        const now = new Date();
        const timeString = now.toLocaleTimeString() + "." + now.getMilliseconds();
        
        // Оновлюємо текст у вікні
        msgLog.textContent = `${eventCounter}. ${message}`;

        // Формуємо об'єкт даних
        // ВАЖЛИВО: timestamp має бути числом (Date.now())
        const eventData = {
            id: eventCounter,
            msg: message,
            client_time: timeString, // Для краси (текст)
            timestamp: Date.now()    // Для математики (число мс)
        };

        // Спосіб 1: Миттєва відправка
        sendToServerImmediate(eventData);

        // Спосіб 2: Збереження в LocalStorage
        saveToLocalStorage(eventData);

        eventCounter++;
    }

    // Спосіб 1: AJAX Fetch (Миттєво)
    function sendToServerImmediate(data) {
        const payload = { ...data, type: 'immediate' };
        
        fetch('server.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error("Помилка відправки:", err));
    }

    // Спосіб 2: LocalStorage (Накопичення)
    function saveToLocalStorage(data) {
        let stored = JSON.parse(localStorage.getItem('anim_events_batch')) || [];
        // Додаємо тип, щоб відрізнити в таблиці
        const payload = { ...data, type: 'batch_local' };
        stored.push(payload);
        localStorage.setItem('anim_events_batch', JSON.stringify(stored));
    }

    // === 2. АНІМАЦІЯ (Фізика кульок) ===
    function createBalls() {
        animArea.innerHTML = '';
        balls = [];
        const width = animArea.clientWidth;
        const height = animArea.clientHeight;

        // Кулька 1 (Червона)
        const b1 = {
            el: document.createElement('div'),
            x: 0, y: Math.random() * (height - diameter),
            vx: (Math.random() * 2 + 2), vy: (Math.random() * 2 + 2) * (Math.random() < 0.5 ? 1 : -1),
            color: 'red'
        };

        // Кулька 2 (Зелена)
        const b2 = {
            el: document.createElement('div'),
            x: Math.random() * (width - diameter), y: 0,
            vx: (Math.random() * 2 + 2) * (Math.random() < 0.5 ? 1 : -1), vy: (Math.random() * 2 + 2),
            color: 'green'
        };

        [b1, b2].forEach(b => {
            b.el.classList.add('ball');
            b.el.style.backgroundColor = b.color;
            b.el.style.left = b.x + 'px';
            b.el.style.top = b.y + 'px';
            animArea.appendChild(b.el);
            balls.push(b);
        });
    }

    function step() {
        if (!isRunning) return;
        const width = animArea.clientWidth;
        const height = animArea.clientHeight;

        balls.forEach(b => {
            b.x += b.vx;
            b.y += b.vy;
            let hit = false;

            if (b.x <= 0) { b.x = 0; b.vx *= -1; hit = true; }
            if (b.x >= width - diameter) { b.x = width - diameter; b.vx *= -1; hit = true; }
            if (b.y <= 0) { b.y = 0; b.vy *= -1; hit = true; }
            if (b.y >= height - diameter) { b.y = height - diameter; b.vy *= -1; hit = true; }

            if (hit) logEvent(`${b.color} hit wall`); // Логування удару

            b.el.style.left = b.x + 'px';
            b.el.style.top = b.y + 'px';
        });

        // Перевірка зіткнення
        const dx = balls[0].x - balls[1].x;
        const dy = balls[0].y - balls[1].y;
        if (Math.sqrt(dx*dx + dy*dy) < diameter) {
            stopAnimation(true);
            logEvent("COLLISION! Stopped.");
        } else {
            animationId = requestAnimationFrame(step);
        }
    }

    // === 3. КЕРУВАННЯ ===
    function startAnimation() {
        if (isRunning) return;
        isRunning = true;
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        reloadBtn.style.display = 'none';
        logEvent("Start pressed");
        step();
    }

    function stopAnimation(collision = false) {
        isRunning = false;
        cancelAnimationFrame(animationId);
        stopBtn.style.display = 'none';
        if (collision) reloadBtn.style.display = 'inline-block';
        else {
            startBtn.style.display = 'inline-block';
            logEvent("Stop pressed");
        }
    }

    function reloadAnimation() {
        createBalls();
        reloadBtn.style.display = 'none';
        startBtn.style.display = 'inline-block';
        logEvent("Reload pressed");
    }

    // === 4. ЗАКРИТТЯ І ЗВІТ (Виправлено await) ===
    async function closeWork() {
        workOverlay.style.display = 'none';
        stopAnimation();

        // Спочатку відправляємо дані LocalStorage
        const batchData = JSON.parse(localStorage.getItem('anim_events_batch')) || [];
        
        if (batchData.length > 0) {
            try {
                // await гарантує, що ми чекаємо завершення відправки
                await fetch('server.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(batchData)
                });
                console.log("Пакет даних успішно відправлено");
            } catch (e) {
                console.error("Помилка відправки пакету:", e);
            }
        }

        // Тільки тепер завантажуємо таблицю
        try {
            const response = await fetch('server.php?nocache=' + Date.now());
            const serverLogs = await response.json();
            renderTable(serverLogs);
        } catch (e) {
            console.error("Помилка отримання логів:", e);
        }
    }

    // === 5. МАЛЮВАННЯ ТАБЛИЦІ (Виправлено розрахунок N/A) ===
	function renderTable(logs) {
        resultsTable.style.display = 'block';
        resultsBody.innerHTML = '';
        
        console.log("LOGS FROM SERVER:", logs); // Дивіться в консоль (F12)

        logs.forEach(log => {
            const tr = document.createElement('tr');
            
            let diff = "N/A";
            let color = "black";

            // 1. Отримуємо час клієнта (Timestamp)
            let clientTs = Number(log.timestamp);
            
            // 2. Отримуємо час сервера (Timestamp)
            let serverTs = Number(log.server_timestamp);

            // ЗАПАСНИЙ ВАРІАНТ: Якщо сервер не повернув timestamp, пробуємо парсити рядок часу
            // Це " милиця" (hack), щоб прибрати N/A, якщо PHP глючить
            if (!serverTs && log.server_saved_at) {
                // Це дуже приблизно, але краще ніж N/A
                let parts = log.server_saved_at.split(':'); // 23:55:10.123
                if(parts.length === 3) {
                    let now = new Date();
                    now.setHours(parts[0], parts[1], parseFloat(parts[2]));
                    serverTs = now.getTime();
                }
            }

            // Розрахунок
            if (!isNaN(clientTs) && !isNaN(serverTs) && serverTs > 0) {
                let val = serverTs - clientTs - 7200000;
                
                // Корекція для читабельності (іноді різниця мізерна)
                diff = val + " ms";

                if (Math.abs(val) > 10000) { 
                    diff += " (batch)";
                    color = "blue";
                } else if (Math.abs(val) > 1000) {
                    color = "red";
                } else {
                    color = "green";
                }
            } else {
                console.error("Помилка розрахунку для ID " + log.id, {clientTs, serverTs});
            }

            tr.innerHTML = `
                <td>${log.id}</td>
                <td>${log.msg} <small style="color:gray">[${log.type}]</small></td>
                <td>${log.server_saved_at}</td>
                <td>${log.client_time}</td>
                <td style="font-weight:bold; color:${color}">${diff}</td>
            `;
            resultsBody.appendChild(tr);
        });
    }

    // Слухачі
    playBtn.addEventListener('click', () => {
        workOverlay.style.display = 'flex';
        // Очищаємо сервер і клієнт перед новим сеансом
        fetch('server.php', { method: 'DELETE' });
        localStorage.setItem('anim_events_batch', JSON.stringify([]));
        eventCounter = 1;
        createBalls();
        resultsTable.style.display = 'none'; // Ховаємо стару таблицю
    });

    startBtn.addEventListener('click', startAnimation);
    stopBtn.addEventListener('click', () => stopAnimation(false));
    reloadBtn.addEventListener('click', reloadAnimation);
    closeBtn.addEventListener('click', closeWork);
});