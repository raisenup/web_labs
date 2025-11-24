// ***** Для index.html (створення) *****
let collapseArray = [];

if (document.getElementById('collapseForm')) {
    const form = document.getElementById('collapseForm');
    const preview = document.getElementById('preview');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = form.title.value.trim();
        const content = form.content.value.trim();
        if(title && content) {
            collapseArray.push({ title, content });
            form.reset();
            renderPreview();
        }
    });

    document.getElementById('saveBtn').onclick = () => {
        fetch('backend/save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(collapseArray)
        })
        .then(r => r.json())
        .then(data => alert(data.status === 'success' ? "Збережено!" : "Помилка!"));
    };

    function renderPreview() {
        preview.innerHTML = '';
        collapseArray.forEach((obj, i) => {
            const div = document.createElement('div');
            div.className = 'collapse-container';
            div.innerHTML = `
                <button class="collapse-toggle">${obj.title}</button>
                <div class="collapse-content">${obj.content}</div>`;
            preview.append(div);
        });
        addCollapseListeners();
    }
    function addCollapseListeners() {
        document.querySelectorAll('.collapse-toggle').forEach(btn => {
            btn.onclick = () => {
                const content = btn.nextElementSibling;
                content.classList.toggle('active');
            };
        });
    }
}

// ***** Для view.html (отримання з сервера) *****
if(document.getElementById('collapses')) {
    function loadCollapses() {
        fetch('backend/load.php')
        .then(r => r.json())
        .then(data => {
            const arr = data[data.length - 1] || []; // останній масив
            const block = document.getElementById('collapses');
            block.innerHTML = '';
            (arr || []).forEach(obj => {
                const div = document.createElement('div');
                div.className = 'collapse-container';
                div.innerHTML = `
                    <button class="collapse-toggle">${obj.title}</button>
                    <div class="collapse-content">${obj.content}</div>`;
                block.append(div);
            });
            addCollapseListeners();
        });
    }
    function addCollapseListeners() {
        document.querySelectorAll('.collapse-toggle').forEach(btn => {
            btn.onclick = () => {
                const content = btn.nextElementSibling;
                content.classList.toggle('active');
            };
        });
    }
    setInterval(loadCollapses, 5000);
    loadCollapses();
}
