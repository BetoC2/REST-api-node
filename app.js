const express = require('express')
const crypto = require('node:crypto')
const { validateMovie, validatePartialMovie } = require('./schema')
const movies = require('./movies.json')

const PORT = process.env.PORT ?? 1234

const app = express()
app.use(express.json())
app.disable('x-powered-by')

// Todos los recursos que sean MOVIES se identifican con el endpoint /movies
app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

// Crear peliculas
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(), // UUID v4
    ...result.data
  }

  // Esto no es rest, queda hacer la base de datos
  movies.push(newMovie)
  res.status(201).json(newMovie) // Actualizar caché del cliente
})

// Filtrar peliculas por id
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)

  if (!movie) return res.status(404).json({ error: 'Movie not found' })

  res.json(movie)
})

// Actualizar peliculas por id
app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

// App listen
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
