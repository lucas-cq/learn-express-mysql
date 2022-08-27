const express = require('express')
const morgan = require('morgan')
const { Prohairesis } = require('prohairesis')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

const mySQLString = process.env.CLEARDB_DATABASE_URL
const database = new Prohairesis(mySQLString)

app
    .use(morgan('dev'))
    .use(express.static('public'))
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())

    .get('/api/user', async (req, res) => {
        const users = await database.query(`
            SELECT
                *
            FROM
                User
            ORDER BY
                date_added DESC
        `)

        res.contentType('html');

        res.end(`
            ${users.map((user) => {
                return `<p>${user.first_name}</p>`
            }).join('')}
        `)
    })

    .post('/api/user', async (req, res) => {
        const body = req.body
 
        await database.execute(`
            INSERT INTO User (
                first_name,
                last_name,
                phone,
                date_added
            ) VALUES (
                @firstName,
                @lastName,
                @phone,
            NOW()
            )
        `, {
            firstName: body.first,
            lastName: body.last,
            phone: body.phone,
        });
        res.end('Added User')
    })

    .listen(port, () => console.log(`Server listening on port ${port}`))