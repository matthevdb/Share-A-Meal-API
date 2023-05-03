const express = require('express')
const assert = require('assert')
const router = express.Router()

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

// UC-201 Registreren als nieuwe user
router.post('/api/user', (req, res) => {
    let { firstName, lastName, emailAdress } = req.body

    try {
        assert(typeof firstName === 'string', 'firstName must be a string')
        assert(typeof lastName === 'string', 'lastName must be a string')
        assert(typeof emailAdress === 'string', 'emailAdress must be a string')

        if (users.some(user => user.emailAdress === emailAdress)) {
            res.status(403).json({
                status: 403,
                message: `User with email adress ${emailAdress} already exists.`,
                data: {}
            })
        } else {
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
                message: `Added user with id ${index}.`,
                data: newUser,
            })
        }
    } catch (error) {
        res.status(400).json({
            status: 400,
            message: error.toString(),
            data: {},
        })
    }
})

// UC-202 Opvragen van overzicht van users
router.get('/api/user', (req, res) => {
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

// UC-203 Opvragen van gebruikersprofiel
router.get('/api/user/profile', (req, res) => {
    res.status(200).json({
        status: 200,
        message: 'Personal user profile succesfully returned.',
        data: users[0]
    })
})

// UC-204 Opvragen van usergegevens bij ID
router.get('/api/user/:id', (req, res) => {
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
            message: `User with id ${id} not found.`,
            data: {}
        })
    }
})

// UC-205 Wijzigen van usergegevens
router.put('/api/user/:id', (req, res) => {
    let id = req.params.id
    let { firstName, lastName, emailAdress } = req.body
    let userId = users.findIndex(user => user.id == id)

    if (userId == -1) {
        res.status(404).json({
            status: 404,
            message: `User with id ${id} not found.`,
            data: {}
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
                message: `Updated user with id ${id}.`,
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
router.delete('/api/user/:id', (req, res) => {
    let id = req.params.id
    let userId = users.findIndex(user => user.id == id)

    if (userId == -1) {
        res.status(404).json({
            status: 404,
            message: `User with id ${id} not found.`,
            data: {}
        })
    } else {
        users.splice(userId, 1)

        res.status(200).json({
            status: 200,
            message: `User with id ${id} deleted.`,
            data: {}
        })
    }
})

module.exports = router
