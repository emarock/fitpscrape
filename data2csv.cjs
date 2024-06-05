const players = require('./data/players-ext-gen')

const fields = [
  {attr: 'n', descr: 'First Name'},
  {attr: 'c', descr: 'Last Name'},
  {attr: 'g', descr: 'Gender'},
  {attr: 'reg', descr: 'Region'},
  {attr: 'pro', descr: 'Area'},
  {attr: 'cit', descr: 'City'},
  {attr: 'cl', descr: 'Club'},
  {attr: 'ce', descr: 'Category'},
  {attr: 'cr', descr: 'Group'},
  {attr: 'gr', descr: 'Level'},
  {attr: 'mr', descr: 'All Time High'},
  {attr: 'pv', descr: 'Wins'},
  {attr: 'pp', descr: 'Losses'}
]

const header = []
fields.forEach((field) => {
  header.push(field.descr)
})
console.log('"' + header.join('","') + '"')

Object.values(players).forEach((player) => {
  const row = []
  fields.forEach((field) => {
    row.push(player[field.attr])
  })
  console.log('"' + row.join('","') + '"')
})
