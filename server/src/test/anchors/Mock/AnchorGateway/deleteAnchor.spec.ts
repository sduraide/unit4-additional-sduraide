import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AnchorGateway } from '../../../../anchors'
import { ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'

describe('Unit Test: deleteAnchorById', () => {
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

  test('deletes valid anchor', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await anchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await anchorGateway.deleteAnchor('anchor1')
    expect(deleteResp.success).toBeTruthy()
    const getResp = await anchorGateway.getAnchorById('anchor1')
    expect(getResp.success).toBeFalsy()
  })

  test('gives success when attempt to delete anchor id that does not exist', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await anchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await anchorGateway.deleteAnchor('invalidId')
    expect(deleteResp.success).toBeTruthy()
  })
})
