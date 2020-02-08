const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()
const Person = require('./models/person')

const app = express()
app.use(express.static('build'))
app.use(cors())
app.use(express.json())

morgan.token('data', req => {
	if (req.method === 'POST') {
		return JSON.stringify(req.body)
	} else {
		return ''
	}
})

app.use(morgan(':method :url :status :response-time ms :data'))

app.get('/info', (req, res) => {
	Person.find({}).then(people => {
		res.send(
			`<p>Phonebook has ${
				people.length
			} numbers.</p><p>${new Date().toString()}</p>`
		)
	})
})

app.get('/api/persons', (req, res) => {
	Person.find({}).then(people => {
		res.json(people.map(person => person.toJSON()))
	})
})

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then(person => {
			if (person) {
				res.json(person.toJSON())
			} else {
				res.status(404).end()
			}
		})
		.catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then(result => {
			res.status(204).end()
		})
		.catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
	const body = req.body

	if (!body.name) {
		return res.status(400).json({
			error: 'Name missing',
		})
	}

	if (!body.number) {
		return res.status(400).json({
			error: 'Number missing',
		})
	}

	const person = new Person({
		name: body.name,
		number: body.number,
	})

	person
		.save()
		.then(savedPerson => savedPerson.toJSON())
		.then(savedAndFormattedPerson => {
			res.json(savedAndFormattedPerson)
		})
		.catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
	const body = req.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true })
		.then(updatedPerson => {
			res.json(updatedPerson.toJSON())
		})
		.catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
	console.error(error.message)

	if (error.name === 'CastError' && error.kind === 'ObjectId') {
		return res.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return res.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
