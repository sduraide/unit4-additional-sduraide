import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AnchorGateway } from '../../../../anchors'
import { ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'

describe('Unit Test: deleteAnchors', () => {
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

  test('deletes valid anchors', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor1 = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse1 = await anchorGateway.createAnchor(validAnchor1)
    expect(createResponse1.success).toBeTruthy()
    const validAnchor2 = makeIAnchor('anchor2', 'node1', textExtent)
    const createResponse2 = await anchorGateway.createAnchor(validAnchor2)
    expect(createResponse2.success).toBeTruthy()
    const deleteResp = await anchorGateway.deleteAnchors(['anchor1', 'anchor2'])
    expect(deleteResp.success).toBeTruthy()
    const getResp1 = await anchorGateway.getAnchorById('anchor1')
    expect(getResp1.success).toBeFalsy()
    const getResp2 = await anchorGateway.getAnchorById('anchor2')
    expect(getResp2.success).toBeFalsy()
  })

  test('success when some anchorids do not exist', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await anchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await anchorGateway.deleteAnchors(['invalidId', 'anchor1'])
    expect(deleteResp.success).toBeTruthy()
  })

  test('success when all anchorids do not exist', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await anchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await anchorGateway.deleteAnchors(['invalidId'])
    expect(deleteResp.success).toBeTruthy()
  })
})
