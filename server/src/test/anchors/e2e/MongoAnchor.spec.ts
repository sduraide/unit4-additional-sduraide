import { MongoClient } from 'mongodb'
import { AnchorGateway } from '../../../anchors'
import {
  IAnchor,
  isSameExtent,
  makeIAnchor,
  makeITextExtent,
  NodeType,
} from '../../../types'
import uniqid from 'uniqid'

jest.setTimeout(50000)

describe('E2E Test: Anchor CRUD', () => {
  let mongoClient: MongoClient
  let anchorGateway: AnchorGateway
  let uri: string
  let collectionName: string

  function generateAnchorId() {
    return uniqid('anchor.')
  }
  function generateNodeId(type: NodeType) {
    return uniqid(type + '.')
  }

  const testAnchor: IAnchor = makeIAnchor(
    generateAnchorId(),
    generateNodeId('text'),
    makeITextExtent('hi', 9, 11)
  )

  beforeAll(async () => {
    uri = process.env.DB_URI
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    collectionName = 'e2e-test-anchors'
    anchorGateway = new AnchorGateway(mongoClient, collectionName)
    await mongoClient.connect()

    const getResponse = await anchorGateway.getAnchorById(testAnchor.anchorId)
    expect(getResponse.success).toBeFalsy()
  })

  afterAll(async () => {
    await mongoClient.db().collection(collectionName).drop()
    const getResponse = await anchorGateway.getAnchorById(testAnchor.anchorId)
    expect(getResponse.success).toBeFalsy()
    await mongoClient.close()
  })

  test('creates anchor', async () => {
    const response = await anchorGateway.createAnchor(testAnchor)
    expect(response.success).toBeTruthy()
  })

  test('retrieves anchor', async () => {
    const response = await anchorGateway.getAnchorById(testAnchor.anchorId)
    expect(response.success).toBeTruthy()
    expect(response.payload.anchorId).toEqual(testAnchor.anchorId)
    expect(isSameExtent(response.payload.extent, testAnchor.extent)).toBeTruthy()
  })

  test('deletes anchor', async () => {
    const deleteResponse = await anchorGateway.deleteAnchor(testAnchor.anchorId)
    expect(deleteResponse.success).toBeTruthy()

    const getResponse = await anchorGateway.getAnchorById(testAnchor.anchorId)
    expect(getResponse.success).toBeFalsy()
  })
})
