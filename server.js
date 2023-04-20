const express = require('express')
const app = express()
const port = 3000

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