// 1
const block4 = document.querySelector('.item.four');
const block5 = document.querySelector('.item.five');
const temp = block4.innerHTML;
block4.innerHTML = block5.innerHTML;
block5.innerHTML = temp;

// 2
function calculateTriangleArea() {
    const a = 5;
    const b = 6;
    const c = 7;
    const p = (a + b + c) / 2;
    const area = Math.sqrt(p * (p - a) * (p - b) * (p - c));
    const result = document.createElement('p');
    result.textContent = `Площа трикутника: ${area.toFixed(2)}`;
    document.querySelector('.item.three').appendChild(result);
}
calculateTriangleArea();

// 3
function countMin() {
    const input = document.getElementById('numbersInput').value;
    const numbers = input.split(',').map(Number);
    const min = Math.min(...numbers);
    const count = numbers.filter(n => n === min).length;
    alert(`Кількість мінімальних чисел: ${count}`);
    document.cookie = `minCount=${count}; path=/`;
    document.getElementById('minForm').remove();
}

window.onload = function() {
    const cookies = document.cookie;
    if (cookies.includes('minCount=')) {
        const count = cookies.split('minCount=')[1].split(';')[0];
        const confirmDelete = confirm(`Збережено: ${count} мінімальних чисел. Після натискання OK дані будуть видалені.`);
        if (confirmDelete) {
            document.cookie = 'minCount=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            alert('Cookies видалено');
            location.reload();
        }
    }
};


// 4
window.addEventListener('load', function() {
    const savedColor = localStorage.getItem('block3Color');
    if (savedColor) {
        document.querySelector('.item.three').style.color = savedColor;
    }

    const newColor = prompt('Введіть колір тексту для блоку 3 (наприклад, red, blue):');
    if (newColor) {
        document.querySelector('.item.three').style.color = newColor;
        localStorage.setItem('block3Color', newColor);
    }
});

// 5
let listItems = [];

document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('dblclick', function() {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Введіть пункт списку';
        const button = document.createElement('button');
        button.textContent = 'Додати';
        button.onclick = function() {
            const value = input.value.trim();
            if (value) {
                listItems.push(value);
                input.value = '';
            }
        };
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Зберегти список';
        saveButton.onclick = function() {
            localStorage.setItem('listItems', JSON.stringify(listItems));
            const ul = document.createElement('ul');
            listItems.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            item.innerHTML = '';
            item.appendChild(ul);
        };
        item.appendChild(input);
        item.appendChild(button);
        item.appendChild(saveButton);
    });
});

window.addEventListener('beforeunload', function() {
    localStorage.removeItem('listItems');
});

