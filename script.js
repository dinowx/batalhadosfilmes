// Aguarda o conteúdo do DOM ser totalmente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    // Elementos da UI
    const battleContainer = document.getElementById('battle-container');
    const winnerAnnouncement = document.getElementById('winner-announcement');
    const loader = document.getElementById('loader');
    const winnerCardElement = document.getElementById('winner-card');
    const movie1Card = document.getElementById('movie-1');
    const movie2Card = document.getElementById('movie-2');
    const movie1Img = movie1Card.querySelector('img');
    const movie1Title = movie1Card.querySelector('h3');
    const movie2Img = movie2Card.querySelector('img');
    const movie2Title = movie2Card.querySelector('h3');
    const reloadButton = document.getElementById('reload-button');

    // Variáveis de estado
    let allMovies = [];
    let moviesInBattle = [];
    let movie1 = null;
    let movie2 = null;

    // Função para buscar os filmes do JSON
    async function fetchMovies() {
        try {
            const response = await fetch('movies.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allMovies = await response.json();
            if (allMovies.length >= 2) {
                startBattle(); // Inicia a primeira batalha após carregar os filmes
            }

        } catch (error) {
            console.error("Não foi possível carregar os filmes:", error);
            // Exibir uma mensagem de erro para o usuário seria uma boa prática
        }
    }

    // Função para obter um filme aleatório, evitando o filme passado como argumento
    // Função para embaralhar um array (algoritmo Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Função para renderizar os filmes na tela
    function renderMovies(movieA, movieB) {
        movie1 = movieA;
        movie2 = movieB;

        movie1Img.src = movie1.poster;
        movie1Img.alt = `Pôster de ${movie1.title}`;
        movie1Title.textContent = movie1.title;

        movie2Img.src = movie2.poster;
        movie2Img.alt = `Pôster de ${movie2.title}`;
        movie2Title.textContent = movie2.title;
    }

    // Função para iniciar uma nova batalha (dois filmes novos)
    function startBattle() {
        // Esconde o loader e mostra a arena de batalha
        loader.style.display = 'none';

        // Reseta a UI para o modo batalha
        battleContainer.style.display = 'flex';
        winnerAnnouncement.style.display = 'none';

        // Cria uma cópia temporária da lista de todos os filmes e a embaralha
        const shuffledMovies = [...allMovies];
        shuffleArray(shuffledMovies);

        // Seleciona os 8 primeiros filmes para o torneio
        moviesInBattle = shuffledMovies.slice(0, 8);

        // Pega os dois primeiros filmes da lista do torneio para começar
        // O restante (6 filmes) fica em `moviesInBattle` para as próximas rodadas
        const contender1 = moviesInBattle.pop();
        const contender2 = moviesInBattle.pop();

        renderMovies(contender1, contender2);
    }

    // Função para lidar com o clique em um filme (voto)
    function handleMovieClick(winner, loser) {
        // Se ainda houver oponentes na lista para batalhar
        if (moviesInBattle.length > 0) {
            const newOpponent = moviesInBattle.pop(); // Pega o próximo oponente

            // O vencedor continua, o perdedor é substituído pelo novo oponente
            // A posição do vencedor determina onde o novo oponente aparecerá
            if (winner.id === movie1.id) {
                renderMovies(winner, newOpponent);
            } else {
                renderMovies(newOpponent, winner);
            }
        } else {
            // Se não houver mais oponentes, o filme clicado é o grande vencedor
            displayFinalWinner(winner);
        }
    }

    // Função para exibir o vencedor final
    function displayFinalWinner(winner) {
        battleContainer.style.display = 'none';
        winnerAnnouncement.style.display = 'flex';

        winnerCardElement.innerHTML = `
            <img src="${winner.poster}" alt="Pôster de ${winner.title}">
            <div class="winner-info">
                <h3>${winner.title}</h3>
                <p class="winner-year">${winner.year}</p>
                <p class="winner-plot">${winner.plot}</p>
            </div>
        `;

        // --- Lógica de Compartilhamento ---
        const shareText = `Meu filme campeão na Batalha de Filmes é: ${winner.title}! 🏆`;
        const encodedShareText = encodeURIComponent(shareText);
        const pageUrl = encodeURIComponent(window.location.href);

        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedShareText}`;
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&quote=${encodedShareText}`;
        const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodedShareText}`;

        document.getElementById('share-twitter').href = twitterShareUrl;
        document.getElementById('share-facebook').href = facebookShareUrl;
        document.getElementById('share-whatsapp').href = whatsappShareUrl;
    }

    // --- EVENT LISTENERS ---

    // Clique no filme 1
    movie1Card.addEventListener('click', () => {
        handleMovieClick(movie1, movie2);
    });

    // Clique no filme 2
    movie2Card.addEventListener('click', () => {
        handleMovieClick(movie2, movie1);
    });

    // Clique no botão de recarregar
    reloadButton.addEventListener('click', startBattle);

    // Ponto de entrada: busca os filmes ao carregar a página
    fetchMovies();
});