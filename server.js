import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares ANTES de rutas
app.use(cors());
app.use(express.json());

// Ruta al JSON (mejor usando el directorio del archivo)
const dataPath = path.resolve('./games.json');

function readGames() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Listado
app.get('/api/games', (_req, res) => {
  const games = readGames();
  res.json(games);
});

// Detalle
app.get('/api/games/:id', (req, res) => {
  const games = readGames();
  const game = games.find(g => String(g.id) === String(req.params.id));
  if (!game) return res.status(404).json({ error: 'No encontrado' });
  res.json(game);
});

// Crear
app.post('/api/games', (req, res) => {
  const { title, genre, rating } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title es obligatorio' });

  const games = readGames();
  const id = games.length ? Math.max(...games.map(g => g.id)) + 1 : 1;
  const newGame = { id, title, genre: genre || '', rating: Number(rating) || 0 };

  games.push(newGame);
  fs.writeFileSync(dataPath, JSON.stringify(games, null, 2));
  res.status(201).json(newGame);
});

app.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT}`);
});
