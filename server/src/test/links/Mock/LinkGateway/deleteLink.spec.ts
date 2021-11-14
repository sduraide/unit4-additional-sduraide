import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { LinkGateway } from '../../../../links'
import { ILink, makeILink } from '../../../../types'

describe('Unit Test: Delete Link By Id', () => {
  let uri
  let mongoClient
  let linkGateway
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    linkGateway = new LinkGateway(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await linkGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('deletes link', async () => {
    const validLink1: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const response1 = await linkGateway.createLink(validLink1)
    expect(response1.success).toBeTruthy()
    const deleteResp = await linkGateway.deleteLink('link1')
    expect(deleteResp.success).toBeTruthy()
    const getResp = await linkGateway.getLinkById('link1')
    expect(getResp.success).toBeFalsy()
  })

  test('gives success when link id does not exist', async () => {
    const validLink1: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await linkGateway.createLink(validLink1)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await linkGateway.deleteLink('link2')
    expect(deleteResp.success).toBeTruthy()
  })
})
