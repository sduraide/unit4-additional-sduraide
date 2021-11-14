import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { LinkGateway } from '../../../../links'
import { ILink, makeILink } from '../../../../types'

describe('Unit Test: getLinkById', () => {
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

  test('gets link when given valid id', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await linkGateway.createLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const getLinkByIdResp = await linkGateway.getLinkById('link1')
    expect(getLinkByIdResp.success).toBeTruthy()
  })

  test('fails to get link when given invalid id', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await linkGateway.createLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const getLinkByIdResp = await linkGateway.getLinkById('link2')
    expect(getLinkByIdResp.success).toBeFalsy()
  })
})
