import express from 'express'
import {config} from 'dotenv'
import {router} from './router.js'
import pkg from 'body-parser'

config()
const app = express()
app.use(pkg.json())
app.use(router)
app.listen(process.env.PORT || 3000, () => {
        console.log('Server started')
    }
)
