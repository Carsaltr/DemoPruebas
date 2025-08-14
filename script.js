let timer;
let timeLeft = 120;

function startGame(type) {
    clearInterval(timer);
    timeLeft = 120;
    document.getElementById('time').textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('¡Tiempo terminado!');
        }
    }, 1000);

    let container = document.getElementById('puzzle-container');
    if (type === 'nino') {
        container.innerHTML = '<h3>Puzzle: Niño con obstáculos</h3><p>(Aquí irá el juego del niño)</p>';
    } else if (type === 'exploradores') {
        container.innerHTML = '<h3>Puzzle: Exploradores</h3><p>(Aquí irá el juego de la bandera)</p>';
    } else if (type === 'pinguino') {
        container.innerHTML = '<h3>Puzzle: Pingüino y osos</h3><p>(Aquí irá el juego del pingüino)</p>';
    }
}
