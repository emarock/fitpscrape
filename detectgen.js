import _ from 'lodash'
import {detect} from 'gender-detection'
import players from './data/players-ext.json' assert {type: 'json'}

let i = 0;
_.each(players, (player) => {
  switch (player.ce) {
  case 'NOR':
    player.g = 'male'
    break
  case 'NOF':
    player.g = 'female'
    break
  default:
    const name = player.n.match(/([^\s]+)/)[1]
    player.g = detect(name)
    if (! /male$/.test(player.g))
      player.g = detect(player.n, 'it')
    if (! /male$/.test(player.g))
      player.g = 'unknown'
  }
  player.g = _.capitalize(player.g)
})

console.log(JSON.stringify(players, null, ' '))
