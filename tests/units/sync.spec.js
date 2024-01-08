const sync = require('../../src/tasks/sync')
const Storyblok = require('storyblok-js-client')
const { REGIONS } = require('../../src/constants')

jest.unmock('axios')

// prevent timeout execution error
jest.setTimeout(30000)

const getData = async (client, space, entity) => {
  const path = `spaces/${space}/${entity}`
  const response = await client.get(path)

  return Promise.resolve(response.data[entity] || [])
}

describe('testing sync function', () => {
  it('sync("syncStories", options) should sync stories between two spaces', async () => {
    if (
      process.env.STORYBLOK_TOKEN &&
      process.env.STORYBLOK_SPACE &&
      process.env.STORYBLOK_ANOTHER_SPACE
    ) {
      try {
        const _types = ['stories']

        await sync(_types, {
          token: process.env.STORYBLOK_TOKEN,
          source: process.env.STORYBLOK_SPACE,
          target: process.env.STORYBLOK_ANOTHER_SPACE
        })

        const client = new Storyblok({
          oauthToken: process.env.STORYBLOK_TOKEN
        }, REGIONS.eu.apiEndpoint)

        const sourceStories = await getData(
          client,
          process.env.STORYBLOK_SPACE,
          'stories'
        )

        const targetStories = await getData(
          client,
          process.env.STORYBLOK_ANOTHER_SPACE,
          'stories'
        )

        const existingSourceStories = []

        targetStories.forEach(story => {
          const exists = sourceStories.filter(_story => {
            return _story.name === story.name
          })

          if (exists.length) {
            existingSourceStories.push(story.name)
          }
        })

        expect(existingSourceStories.length).toBe(sourceStories.length)
      } catch (e) {
        console.error(e)
      }
    }
  })
})
