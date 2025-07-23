// /pages/api/quiz.js
import prisma from '@/lib/prisma_responses';
import nodemailer from "nodemailer";
import fs from 'fs';
import path from 'path';

const imagePath = path.join(process.cwd(), 'public', 'perfiles', `${perfilFile}.png`);

const NUM_QUESTIONS = 20;

// Mapa de categorías en el mismo orden que tus preguntas del frontend
// (sirve para recalcular perfil en el servidor)
const categories = [
  'Chik Innovador','Chik Innovador','Chik Innovador','Chik Innovador',
  'Chik Líder','Chik Líder','Chik Líder','Chik Líder',
  'Chik Solidario','Chik Solidario','Chik Solidario','Chik Solidario',
  'Chik Explorador','Chik Explorador','Chik Explorador','Chik Explorador',
  'Chik Protector','Chik Protector','Chik Protector','Chik Protector',
];

// Recalcula puntajes y perfil en el servidor
function derivePerfil(values) {
  const scores = {
    'Chik Innovador': 0,
    'Chik Líder': 0,
    'Chik Solidario': 0,
    'Chik Explorador': 0,
    'Chik Protector': 0,
  };
  values.forEach((v, i) => {
    const cat = categories[i];
    if (cat) scores[cat] += v;
  });

  const totalPoints = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = Math.max(...Object.values(scores));
  let perfil = 'Chik Versátil';
  if (maxScore >= 8) {
    // primer perfil que empate con el maxscore
    perfil = Object.keys(scores).find((k) => scores[k] === maxScore) || perfil;
  }
  return { perfil, totalPoints, scores };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { nombre, email, permisos, respuestas, totalPoints, perfil } = req.body || {};

    // Validaciones básicas mínimas (ajusta a tus necesidades)
    if (!nombre || !email || typeof permisos !== 'boolean') {
      return res.status(400).json({ message: 'Datos faltantes: nombre, email o permisos.' });
    }

    if (!Array.isArray(respuestas) || respuestas.length !== NUM_QUESTIONS) {
      return res.status(400).json({ message: 'Número de respuestas inválido.' });
    }

    // Normaliza a enteros 1-5
    const vals = respuestas.map((v) => Number(v));
    if (vals.some((v) => Number.isNaN(v) || v < 1 || v > 5)) {
      return res.status(400).json({ message: 'Respuestas fuera de rango (1-5).' });
    }

    // --- Recalcular en servidor (recomendado) ---
    const derived = derivePerfil(vals);
    const finalTotal = derived.totalPoints;
    const finalPerfil = derived.perfil;

    // --- Si prefieres confiar en lo que envía el cliente, usa en cambio: ---
    // const finalTotal = Number(totalPoints) || vals.reduce((a,b)=>a+b,0);
    // const finalPerfil = perfil || derived.perfil;

    // Construir payload para Prisma (20 columnas)
    const respuestaData = {};
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      respuestaData[`respuesta${i + 1}`] = vals[i];
    }

    const record = await prisma.quizResponse.create({
      data: {
        nombre,
        email,
        permisos,
        totalPoints: finalTotal,
        perfil: finalPerfil,
        ...respuestaData,        
        // createdAt se autogenera vía @default(now())
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        totalPoints: true,
        perfil: true,
        createdAt: true,
      },
    });

    console.log('Quiz response created:', record);
    await sendResultEmail(email, nombre, record.perfil, record.totalPoints);

    return res.status(201).json({
      message: 'Guardado',
      ...record,
    });
  } catch (error) {
    console.error('Error creating quiz response:', error);
    return res.status(500).json({ message: 'Error al guardar' });
  }
}

// --- Email Sender ---
async function sendResultEmail(to, nombre, perfil, totalPoints) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  function getPerfilImageFile(perfil) {
    return perfil.replace(/\s+/g, '_'); // Reemplaza espacios por _
  }

  const perfilFile = getPerfilImageFile(perfil)

  // Plantilla HTML del correo
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
      <h2 style="color: #4CAF50;">¡Hola ${nombre}!</h2>
      <p>Tu perfil <strong>${perfil}</strong> ha sido calculado con un total de <strong>${totalPoints} puntos</strong>.</p>
      <img src="cid:perfilImage" alt="Logo" width="200" />
      <p>Gracias por completar el test. Apóyanos en nuestras redes sociales:</p>  
      
      <a href="https://www.instagram.com/socialmentechik/" target="_blank" style="color: #000000; text-decoration: none; display: inline-block;">
        <img 
          src="https://cdn-icons-png.flaticon.com/256/87/87390.png" 
          alt="Síguenos en Instagram" 
          width="50" 
          style="display: block; border: 0; outline: none;"
        />
      </a>
      <hr style="border:none;border-top:1px solid #ccc;margin:20px 0;" />
      <p style="font-size:12px;color:#555;">Este email fue enviado automáticamente. Por favor, no respondas a este mensaje.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: '¡Resultado Final de tu Test!',
    html: htmlContent,
    attachments: [
      {
        filename: `${perfilFile}.png`,
        path: imagePath,
        cid: 'perfilImage',
      },
    ],
  });

  console.log(`Correo enviado a ${to}`);
}