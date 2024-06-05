import fetch from 'node-fetch'
import PQueue from 'p-queue'
import Debug from 'debug'
import _ from 'lodash'
import data from './data/players.json' assert {type: 'json'}

const debug = new Debug('getextra')
const queue = new PQueue({
  concurrency: 20
})
//const url = 'https://dp-fit-prod-function.azurewebsites.net/api/v6/player/sheet/simple'

const url = 'https://dp-myfit-prod-function.azurewebsites.net/api/v1/tesserati/dettaglio/semplice'

const maxRetries = 3

async function retrieve(player, retry) {
  debug(`retrieving player ${player.Id}`)

  const body = {
    'cardNumber': player.Id,
    'fromYear': 1950,
    'toYear': 2100
  }

  try {
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify(body)
    })

    const info = await response.json()
    debug(`retrieved player ${player.Id}`)
    player.cl = info.player['tennis_club_name']
  } catch (err) {
    debug(`request failed for ${player.Id}`)
    retry = (retry || 0) + 1
    if (retry <= maxRetries) {
      debug(`scheduling retry for ${player.Id}`)
      queue.add(async function () {
        await retrieve(player, retry)
      }, {
        priority: 1
      })
    } else {
      debug(`reached max retry, skipping ${player.Id}`)
      debug(`exception was: ${err}`)
    }
  }
}

(async function () {

  // const players = _.pick(data, _.slice(_.keys(data), 0, 10))
  const players = data
  for (let id in players) {
    debug(`queuing retriever for ${id}`)
    queue.add(async function () {
      await retrieve(players[id])
    })
  }

  queue.on('idle', () => {
    console.log(JSON.stringify(players, null, ' '))
  })
  queue.on('completed', () => {
    debug(`${queue.size} tasks waiting`)
  })
})()
