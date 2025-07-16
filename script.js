const questions = [
  { text: "Me gusta encontrar soluciones originales a los problemas cotidianos.", category: "Chik Innovador" },
  { text: "Disfruto imaginar cómo podría mejorar mi comunidad o entorno.", category: "Chik Innovador" },
  { text: "Prefiero trabajar en proyectos que requieran creatividad y nuevas ideas.", category: "Chik Innovador" },
  { text: "Me siento inspirado al proponer algo que nadie ha intentado antes.", category: "Chik Innovador" },

  { text: "Suelo tomar la iniciativa cuando estoy en un grupo.", category: "Chik Líder" },
  { text: "Me gusta guiar a otros hacia metas comunes.", category: "Chik Líder" },
  { text: "Creo que puedo inspirar a las personas con mis acciones o palabras.", category: "Chik Líder" },
  { text: "Me siento cómodo tomando decisiones importantes en equipo.", category: "Chik Líder" },

  { text: "Es importante para mí que todos en mi entorno se sientan incluidos.", category: "Chik Solidario" },
  { text: "Prefiero resolver conflictos hablando y buscando acuerdos.", category: "Chik Solidario" },
  { text: "Me gusta ayudar a las personas que enfrentan dificultades.", category: "Chik Solidario" },
  { text: "Me siento feliz cuando contribuyo al bienestar de otros.", category: "Chik Solidario" },

  { text: "Me interesa aprender cosas nuevas constantemente.", category: "Chik Explorador" },
  { text: "Prefiero experiencias nuevas a rutinas repetitivas.", category: "Chik Explorador" },
  { text: "Me adapto rápidamente cuando algo en mi vida cambia.", category: "Chik Explorador" },
  { text: "Me entusiasma conocer personas, culturas o ideas diferentes.", category: "Chik Explorador" },

  { text: "Me preocupo por mantener la estabilidad en mi entorno.", category: "Chik Protector" },
  { text: "Creo que es importante cuidar los recursos y proteger lo que es valioso.", category: "Chik Protector" },
  { text: "Me esfuerzo por cumplir con mis compromisos, pase lo que pase.", category: "Chik Protector" },
  { text: "Me siento realizado cuando contribuyo al bienestar de mi comunidad.", category: "Chik Protector" }
];

let currentQuestion = 0;
const answers = Array(questions.length).fill(null); // Para guardar respuestas en cualquier orden
const scores = {
  "Chik Innovador": 0,
  "Chik Líder": 0,
  "Chik Solidario": 0,
  "Chik Explorador": 0,
  "Chik Protector": 0
};

const quizContainer = document.getElementById("quiz-container");
const resultDiv = document.getElementById("result");

// Crear botones dinámicamente
const prevBtn = document.createElement("button");
prevBtn.id = "prev-btn";
prevBtn.textContent = "Regresar";
prevBtn.className = "btn btn-warning me-2";

const nextBtn = document.createElement("button");
nextBtn.id = "next-btn";
nextBtn.textContent = "Siguiente";
nextBtn.className = "btn btn-primary";

const restartBtn = document.createElement("button");
restartBtn.id = "restart-btn";
restartBtn.textContent = "Reiniciar";
restartBtn.className = "btn btn-danger d-none";

const btnContainer = document.createElement("div");
btnContainer.className = "d-flex gap-2 mt-3";
btnContainer.appendChild(prevBtn);
btnContainer.appendChild(nextBtn);
btnContainer.appendChild(restartBtn);
quizContainer.after(btnContainer);

function showQuestion(index) {

  const q = questions[index];
  quizContainer.innerHTML = `
    <h4 class="mb-3">${index + 1}. ${q.text}</h4>
    ${[1, 2, 3, 4, 5].map(value => `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="answer" value="${value}" id="opt${value}" ${answers[index] === value ? 'checked' : ''}>
        <label class="form-check-label" for="opt${value}">
          ${value} - ${
            value === 1 ? "Totalmente en desacuerdo" :
            value === 2 ? "En desacuerdo" :
            value === 3 ? "Neutral" :
            value === 4 ? "De acuerdo" :
            "Totalmente de acuerdo"
          }
        </label>
      </div>
    `).join('')}
  `;

  prevBtn.disabled = currentQuestion === 0;
  updateProgressDots(index);

}

function showResult() {
  // Reiniciar scores
  Object.keys(scores).forEach(k => scores[k] = 0);

  questions.forEach((q, i) => {
    scores[q.category] += answers[i];
  });

  const totalPuntos = Object.values(scores).reduce((a, b) => a + b, 0);
  const valores = Object.entries(scores);
  const maxPuntaje = Math.max(...valores.map(([_, val]) => val));

  let perfil = "Chik Versátil";

  if (maxPuntaje >= 8) {
    const categorias = ["Chik Innovador", "Chik Líder", "Chik Solidario", "Chik Explorador", "Chik Protector"];
    const indice = valores.findIndex(([_, val]) => val === maxPuntaje);
    perfil = categorias[indice];
  }

  Swal.fire({
    title: `¡Resultado Final!`,
    icon: 'success',
    html: `
      <p><strong>Tu perfil Chik más destacado es:</strong> ${perfil}</p>
      <p><strong>Total de puntos:</strong> ${totalPuntos} / 100</p>
    `,
    confirmButtonText: 'Aceptar'
  });

  quizContainer.innerHTML = "";
  nextBtn.classList.add("d-none");
  prevBtn.classList.add("d-none");
  restartBtn.classList.remove("d-none");
}

nextBtn.addEventListener("click", () => {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) {
    Swal.fire({
      icon: 'warning',
      title: 'Espera chick...',
      text: 'Por favor selecciona una opción antes de continuar.'
    });
    return;
  }

  answers[currentQuestion] = parseInt(selected.value);

  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion(currentQuestion);
  } else {
    showResult();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion(currentQuestion);
  }
});

restartBtn.addEventListener("click", () => {
  currentQuestion = 0;
  answers.fill(null);
  restartBtn.classList.add("d-none");
  nextBtn.classList.remove("d-none");
  prevBtn.classList.remove("d-none");
  resultDiv.innerHTML = "";
  showQuestion(currentQuestion);
});

showQuestion(currentQuestion);


const progressContainer = document.getElementById("progress-indicator");

// Inicializar las burbujitas una vez
function initProgressDots() {
  progressContainer.innerHTML = '';
  for (let i = 0; i < questions.length; i++) {
    const dot = document.createElement("div");
    dot.classList.add("progress-dot");
    if (i === 0) dot.classList.add("active");
    progressContainer.appendChild(dot);
  }
}

// Actualizar el estado de las burbujitas
function updateProgressDots(index) {
  const dots = document.querySelectorAll(".progress-dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}
