const express = require("express")
const app = express()
const morgan = require("morgan")

app.use(express.json())

morgan.token("data", req => {
  if (req.method === "POST") {
    return JSON.stringify(req.body)
  } else {
    return ""
  }
})

//app.use(morgan("tiny"))
app.use(morgan(':method :url :status :response-time ms :data'))

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
]

app.get("/info", (req, res) => {
  const information = `<p>Phonebook has ${
    persons.length
  } numbers.</p><p>${new Date().toString()}</p>`
  res.send(information)
})

app.get("/api/persons", (req, res) => {
  res.json(persons)
})

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

app.post("/api/persons", (req, res) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({
      error: "Name missing",
    })
  }

  if (!body.number) {
    return res.status(400).json({
      error: "Number missing",
    })
  }

  const previousEntry = persons.find(person => person.name === body.name)
  if (previousEntry) {
    return res.status(400).json({
      error: "A person with that name has already been added",
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * Math.floor(1000)),
  }

  persons = persons.concat(person)

  res.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
