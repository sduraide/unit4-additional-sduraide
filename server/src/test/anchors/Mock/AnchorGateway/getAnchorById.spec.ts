import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AnchorGateway } from '../../../../anchors'
import { ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'

describe('Unit Test: getAnchorById', () => {
  let uri
  let mongoClient
  let anchorGateway
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    anchorGateway = new AnchorGateway(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await anchorGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('gets anchor when given valid id', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await anchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const getAnchorByIdResp = await anchorGateway.getAnchorById(validAnchor.anchorId)
    expect(getAnchorByIdResp.success).toBeTruthy()
  })

  test('fails to get anchor when given invalid id', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await anchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const getAnchorByIdResp = await anchorGateway.getAnchorById('anchor2')
    expect(getAnchorByIdResp.success).toBeFalsy()
  })
})
