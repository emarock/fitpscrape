import fetch, { AbortError } from 'node-fetch'
import PQueue from 'p-queue'
import Debug from 'debug'

const debug = new Debug('getplayers')
const queue = new PQueue({
  concurrency: 5
})
//const url = 'https://dp-fit-prod-function.azurewebsites.net/api/v6/players/list'

const url = 'https://dp-myfit-prod-function.azurewebsites.net/api/v1/tesserati/list'

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

  try {
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify(body)
    })

    if (response.status == 200) {
      const body = await response.json()
      debug(`retrieved ${body.giocatori.length} players for ${term}`)
      body.giocatori.forEach((player) => {
        players[player.Id] = player
      })
    } else {
      debug(`unexpected response code: ${response.status}`)
    }
  } catch (err) {
    if (err instanceof AbortError) {
      letters.forEach((letter) => {
        if (term.match(/^[a-z]+$/) || letter.match(/^[a-z]$/)) {
          debug(`adding retriever for ${term + letter}`)
          queue.add(async function() {
            await retrieve(term + letter)
          })
        }
      })
    } else {
      debug(`retrieved 0 players for ${term}`)
    }
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
