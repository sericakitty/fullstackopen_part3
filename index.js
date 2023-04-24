
require('dotenv').config()

// import express from 'express'
const express = require('express')
const cors = require('cors')


// 3.7 add morgan middleware to app
const morgan = require('morgan')

const Person = require('./models/person')


const app = express()

app.use(express.json())
app.use(cors())


// 3.9 add static build folder to app
app.use(express.static('build'))




// 3.8 use morgan middleware to log POST requests
morgan.token('POST-data', (req) => {
  const body = req.body
  const dataObject = { name: body.name, number: body.number }

  return JSON.stringify(dataObject)
})

// 3.7 use morgan middleware on app
app.use(morgan(`Method: :method
Path: :url
Status: :status
Content-length: :res[content-length]
Response-time: :response-time ms
Body: :POST-data
---`))


// 3.1 GET request to get all persons
app.get('/api/persons', (req, res) => {
  // 3.13 use mongoose to get all persons from database
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

// 3.2 GET request to get info
app.get('/info', (req, res) => {
  // 3.18
  // find all persons and return the length of the array and the current date
  Person.find({}).then(persons => {
    res.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
    `)
  })
})

// 3.3 GET request to get a single person data
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  //3.18 use mongoose to get a single person from the database
  Person.findById(id)
    .then(person => {

      if (!person) {
        res.status(404).end()
      } else {
        res.json(person)
      }

    })
    .catch(error => next(error))
})



// 3.5 POST request to add a new person to the phonebook
app.post('/api/persons', (req, res, next) => {
  // get the body of the request
  const body = req.body

  // 3.14 define a new person object using mongoose and save it to the database

  // make new person object
  const newPersonObject = new Person({
    id: Math.floor(Math.random() * 1000000),
    name: body.name,
    number: body.number
  })

  // add new person to persons array
  newPersonObject.save()
    .then(savedPerson => {
      // return status 201 and the new person object
      res.status(201).json(savedPerson)
    })
    // 3.6 if name or number validation fails, return 400 and error message
    .catch(error => next(error))

})

// 3.17 add PUT request to update a single person's number
app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  const id = req.params.id

  Person.findByIdAndUpdate(id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})



// 3.4 DELETE request to delete a single person data
app.delete('/api/persons/:id', (req, res, next) => {
  // first get id from params
  const id = req.params.id
  // check if person with id exists
  // const person = persons.find(person => person.id === id)
  const person = Person.findById(id)


  // if person does not exist, return 404 and
  if (!person) {
    return res.status(404).json({ error: 'id does not exist' }).end()
  }

  // if person exists, filter out the person with the id and return 204
  // 3.15 use mongoose to delete a person from the database
  Person.findByIdAndRemove(id)
    .then(() => {

      // return 204
      res.status(204).end()
    })
    .catch(error => next(error))
})

// 3.16
// next two middlewares are for handling unknown endpoints and errors
// these middlewares are defined after all the routes

const unknownEndpoint = (_req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

// unknown endpoint middleware
app.use(unknownEndpoint)


const errorHandler = (error, _req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

// error handler middleware
app.use(errorHandler)






// configure port, either from env
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})