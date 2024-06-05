import fetch from 'node-fetch'
import PQueue from 'p-queue'
import Debug from 'debug'

const debug = new Debug('getplayers')
const queue = new PQueue({
  concurrency: 5
})
const url = 'https://dp-fit-prod-function.azurewebsites.net/api/v6/players/list'

const letters = 'abcdefghijklmnopqrstuvxwyz\''.split('')
//const letters = 'abc\''.split('')

const players = {}

async function retrieve(term) {
  debug(`retrieving players for ${term}`)

  const body = {
    "id_disciplina": 172,
    "id_provincia": null,
    "id_regione": null,
    "id_gruppo_rank": "0",
    "id_categoria_rank": "0",
    "id_categoria_eta": null,
    "sesso": null,
    "freetext": term,
    "rowstoskip": 0,
    "fetchrows": 30000,
    "sortcolumn": null,
    "sortorder": null
  }
  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify(body)
  })

  if (response.status == 200) {
    try {
      const body = await response.json()
      debug(`retrieved ${body.giocatori.length} players for ${term}`)
      body.giocatori.forEach((player) => {
        players[player.Id] = player
      })
    } catch (err) {
      debug(`retrieved 0 players for ${term}`)
    }
  } else if (response.status == 400) {
    letters.forEach((letter) => {
      if (term.match(/^[a-z]+$/) || letter.match(/^[a-z]$/)) {
        debug(`adding retriever for ${term + letter}`)
        queue.add(async function() {
          await retrieve(term + letter)
        })
      }
    })
  } else {
    debug(`unhandled response code ${response.status}`)
  }
}

(async function () {
  try {
    letters.forEach((letter) => {
      if (letter.match(/[a-z]/)) {
        debug(`adding retriever for ${letter}`)
        queue.add(async function () {
          await retrieve(letter)
        })
      }
    })
    queue.on('idle', () => {
      console.log(JSON.stringify(players, null, ' '))
    })
    queue.on('completed', () => {
      debug(`${queue.size} tasks waiting`)
    })
  } catch (e) {
    console.error('Error:', e)
  }
})()
