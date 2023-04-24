const express = require('express')
const assert = require('assert')
const app = express()
const port = 3000
app.use(express.json())

// In-memory database
let users = [
    {
        id: 1,
        firstName: 'Matthé',
        lastName: 'van den Berg',
        emailAdress: 'mat.vandenberg@student.avans.nl',
    },
    {
        id: 2,
        firstName: 'Robin',
        lastName: 'Schellius',
        emailAdress: 'r.schellius@avans.nl',
    },
]
let index = users.length

const SYSINFO = {
    studentName: 'Matthé van den Berg',
    studentNumber: '2201635',
    description: 'An API for storing and retrieving shared meals.'
}

app.use('*', (req, res, next) => {
    const method = req.method
    console.log(`Methode: ${method} has been called`)
    next()
})

app.get('/api/info', (req, res) => {
    res.status(200).json(
        {
            status: 200,
            message: 'Server info-endpoint',
            data: SYSINFO
        }
    )
})

// UC-201 Registreren als nieuwe user
app.post('/api/user', (req, res) => {
    let { firstName, lastName, emailAdress } = req.body

    try {
        assert(typeof firstName === 'string', 'firstName must be a string')
        assert(typeof lastName === 'string', 'lastName must be a string')
        assert(typeof emailAdress === 'string', 'emailAdress must be a string')

        index = index + 1
        let newUser = {
            id: index,
            firstName: firstName,
            lastName: lastName,
            emailAdress: emailAdress
        }
        users.push(newUser)

        res.status(201).json({
            status: 201,
            message: `Added user with id ${index}`,
            data: newUser,
        })
    } catch (error) {
        res.status(400).json({
            status: 400,
            message: error.toString(),
            data: {},
        })
    }
})

// UC-202 Opvragen van overzicht van users
app.get('/api/user', (req, res) => {
    let filters = req.query;
    let filteredUsers = users.filter(user => {
        let isValid = true;
        for (key in filters) {
            console.log(key, user[key], filters[key]);
            isValid = isValid && user[key].toString().toLowerCase() == filters[key].toString().toLowerCase();
        }
        return isValid;
    });
    if (filteredUsers.length > 0) {
        res.status(200).json({
            status: 200,
            message: 'Users found matching the search parameters.',
            data: filteredUsers
        })
    } else {
        res.status(404).json({
            status: 404,
            message: 'No users found matching the search parameters.',
            data: {}
        })
    }
})

// UC-204 Opvragen van usergegevens bij ID
app.get('/api/user/:id', (req, res) => {
    let id = req.params.id
    let user = users.filter(user => user.id == id)
    if (user.length > 0) {
        res.status(200).json({
            status: 200,
            message: `User with id ${id} found.`,
            data: user
        })
    } else {
        res.status(404).json({
            status: 404,
            message: `User with id ${id} not found.`
        })
    }
})

// UC-205 Wijzigen van usergegevens
app.put('/api/user/:id', (req, res) => {
    let id = req.params.id
    let { firstName, lastName, emailAdress } = req.body
    let userId = users.findIndex(user => user.id == id)

    if (userId == -1) {
        res.status(404).json({
            status: 404,
            message: `User with id ${id} not found.`
        })
    } else {
        try {
            assert(typeof firstName === 'string', 'firstName must be a string')
            assert(typeof lastName === 'string', 'lastName must be a string')
            assert(typeof emailAdress === 'string', 'emailAdress must be a string')
    
            let changedUser = {
                id: id,
                firstName: firstName,
                lastName: lastName,
                emailAdress: emailAdress
            }

            users[userId] = changedUser
    
            res.status(201).json({
                status: 201,
                message: `Updated user with id ${id}`,
                data: changedUser,
            })
        } catch (error) {
            res.status(400).json({
                status: 400,
                message: error.toString(),
                data: {},
            })
        }
    }
})

// UC-206 Verwijderen van user
app.delete('/api/user/:id', (req, res) => {
    let id = req.params.id
    let userId = users.findIndex(user => user.id == id)

    if (userId == -1) {
        res.status(404).json({
            status: 404,
            message: `User with id ${id} not found.`
        })
    } else {
        users.splice(userId, 1)

        res.status(200).json({
            status: 200,
            message: `User with id ${id} deleted.`
        })
    }
})

app.use('*', (req, res) => {
    res.status(404).json(
        {
            status: 404,
            message: 'Endpoint not found',
            data: {}
        }
    )
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

module.exports = app