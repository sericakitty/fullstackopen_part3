// 3.13 Person model
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

// url comes from the environment variable MONGODB_URI
const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url).then(() => {
  console.log('connected to MongoDB')
}).catch((error) => {
  console.log('error connecting to MongoDB:', error.message)
})

// 3.19 - 3.21 Validate name and number with specific rules
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    minlength: 8,
    validate: {
      validator: (v) => {
        return /\d{2,3}-\d{7,8}/.test(v)
      },
      message: () => 'Number must be in the format \'123-4567890\' or \'12-34567890\''
    },
    required: true,
  },
})

personSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// export the model
const Person = mongoose.model('Person', personSchema)
module.exports = Person