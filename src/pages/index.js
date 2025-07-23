import { useState } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import mystyles from '../styles/Home.module.css';
import Image from 'next/image';

const questions = [
  { text: 'Me gusta encontrar soluciones originales a los problemas cotidianos.', category: 'Chik Innovador' },
  { text: 'Disfruto imaginar cómo podría mejorar mi comunidad o entorno.', category: 'Chik Innovador' },
  { text: 'Prefiero trabajar en proyectos que requieran creatividad y nuevas ideas.', category: 'Chik Innovador' },
  { text: 'Me siento inspirado al proponer algo que nadie ha intentado antes.', category: 'Chik Innovador' },
  { text: 'Suelo tomar la iniciativa cuando estoy en un grupo.', category: 'Chik Líder' },
  { text: 'Me gusta guiar a otros hacia metas comunes.', category: 'Chik Líder' },
  { text: 'Creo que puedo inspirar a las personas con mis acciones o palabras.', category: 'Chik Líder' },
  { text: 'Me siento cómodo tomando decisiones importantes en equipo.', category: 'Chik Líder' },
  { text: 'Es importante para mí que todos en mi entorno se sientan incluidos.', category: 'Chik Solidario' },
  { text: 'Prefiero resolver conflictos hablando y buscando acuerdos.', category: 'Chik Solidario' },
  { text: 'Me gusta ayudar a las personas que enfrentan dificultades.', category: 'Chik Solidario' },
  { text: 'Me siento feliz cuando contribuyo al bienestar de otros.', category: 'Chik Solidario' },
  { text: 'Me interesa aprender cosas nuevas constantemente.', category: 'Chik Explorador' },
  { text: 'Prefiero experiencias nuevas a rutinas repetitivas.', category: 'Chik Explorador' },
  { text: 'Me adapto rápidamente cuando algo en mi vida cambia.', category: 'Chik Explorador' },
  { text: 'Me entusiasma conocer personas, culturas o ideas diferentes.', category: 'Chik Explorador' },
  { text: 'Me preocupo por mantener la estabilidad en mi entorno.', category: 'Chik Protector' },
  { text: 'Creo que es importante cuidar los recursos y proteger lo que es valioso.', category: 'Chik Protector' },
  { text: 'Me esfuerzo por cumplir con mis compromisos, pase lo que pase.', category: 'Chik Protector' },
  { text: 'Me siento realizado cuando contribuyo al bienestar de mi comunidad.', category: 'Chik Protector' },
];

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [saving, setSaving] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    permisos: false,
  });

  const handleAnswer = (value) => {
    const next = [...answers];
    next[currentQuestion] = value;
    setAnswers(next);
  };

  const calcScores = () => {
    const scores = {
      'Chik Innovador': 0,
      'Chik Líder': 0,
      'Chik Solidario': 0,
      'Chik Explorador': 0,
      'Chik Protector': 0,
    };
    questions.forEach((q, i) => { scores[q.category] += answers[i] || 0; });
    return scores;
  };

  const showResult = async () => {
    if (answers.includes(null)) {
      return Swal.fire({ icon: 'warning', title: 'Faltan respuestas', text: 'Responde todas las preguntas.' });
    }

    const scores = calcScores();
    const totalPoints = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxScore = Math.max(...Object.values(scores));
    let perfil = 'Chik Versátil';
    if (maxScore >= 8) perfil = Object.keys(scores).find(k => scores[k] === maxScore);

    Swal.fire({
      title: '¡Analizando resultados!',
      html: `<p><strong>Realizando analisis sobre tu perfil:</strong></p>
        <p><strong>Enviando correo:</strong></p>
      `,
      didOpen: () => {
        Swal.showLoading();
      },
      timer: 5000,
      timerProgressBar: true,
      allowOutsideClick: false,   
      
    });

    try {
      setSaving(true);
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          respuestas: answers,
        }),
      });
          
      if (!res.ok) throw new Error('Error al guardar');
      const data = await res.json();
      const perfilFile = data.perfil.replace(/\s+/g, '_');
      const imageUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/perfiles/${encodeURIComponent(perfilFile)}.png`;

      Swal.fire({
        title: '¡Resultado Final!',
        html: `
        <p><strong>Perfil:</strong> ${data.perfil}</p>
        <p>Total puntos: ${data.totalPoints}</p>
        <img src="${imageUrl}" alt="Logo" width="200"/>
        <p>Gracias por participar. Revisa tu correo e infórmate más sobre nosotros.</p>
        `,
      });
      
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: 'error', title: 'No se guardó', text: 'Inténtalo otra vez.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={mystyles['form-signin']}>
      <div className={mystyles['box_logo_chik']}>
        
          <Image className={mystyles['logo_chik']} src="/10.svg" alt="Logo" width={200} height={100} herf="/index" />
        
      </div>
      
      <div className={mystyles['box-titulo']}>
        <h2 className={mystyles['titulo']}>¿QUÉ TIPO DE <strong>CHIK ERES?</strong></h2>
      </div>
      {!formCompleted ? (
        <form onSubmit={e => {
          e.preventDefault();
          if (!formData.nombre || !formData.email || !formData.permisos) {
            Swal.fire({ icon: 'warning', title: 'Completa todos los campos y acepta los permisos' });
            return;
          }
          setFormCompleted(true);
        }}>

          <div className={mystyles['form_data']}>
             <h2 style={{marginleft: 'auto', marginright: 'auto', display: 'block',}} >SER CHIK, participa y conoce que tipo de chik eres, se evaluara mediante afirmaciones que permiten identificar rasgos específicos de personalidad, requiere un tiempo aproximado de 15 minutos. Está compuesto por 20 ítems que exploran los perfiles</h2>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="floatingNombre"
                placeholder="Nombre (Apodo)"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
              <label htmlFor="floatingNombre">Nombre (Apodo)</label>
            </div>

            {/* Email */}
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="floatingEmail"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <label htmlFor="floatingEmail">Email</label>
            </div>

            {/* Permisos (checkbox no soporta floating, se deja estilo estándar) */}
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="permisosCheck"
                checked={formData.permisos}
                onChange={(e) => setFormData({ ...formData, permisos: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="permisosCheck">
                Acepto compartir mis respuestas y recibir información a mi correo sobre el test.
              </label>
            </div>
          </div>  
          <div className={mystyles['box-button']}>
            <button type="submit" style={{ marginTop: 12 }}>Comenzar Test</button>
          </div>
            
        </form>
      ) : (
        <div className={mystyles['quiz-container']}>
          <p><strong>{currentQuestion + 1} / {questions.length}</strong></p>
          {questions[currentQuestion] && (
            <>
              <h4>{questions[currentQuestion].text}</h4>
                {[1, 2, 3, 4, 5].map(v => (
                  <label key={v} style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="radio"
                      name={`q-${currentQuestion}`}
                      value={v}
                      checked={answers[currentQuestion] === v}
                      onChange={() => handleAnswer(v)}
                    />{' '}
                    {v === 1 ? 'Totalmente en desacuerdo' : v === 2 ? 'En desacuerdo' : v === 3 ? 'Neutral' : v === 4 ? 'De acuerdo' : 'Totalmente de acuerdo'}
                  </label>
                ))}
              <div className={mystyles['box-final-button']} style={{ gap: 8,}}>
                <button class="btn btn-light" style={{backgroundColor: '#D3FC10',}} disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(c => c - 1)}>Regresar</button>
                {currentQuestion < questions.length - 1 ? (
                  <button class="btn btn-light" onClick={() => setCurrentQuestion(c => c + 1)}>Siguiente</button>
                ) : (
                  <button class="btn btn-info" disabled={saving} onClick={showResult}>{saving ? 'Guardando...' : 'Finalizar'}</button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
