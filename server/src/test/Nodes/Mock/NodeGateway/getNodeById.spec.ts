import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NodeGateway } from '../../../../nodes'
import { INode, makeIFilePath } from '../../../../types'

describe('Unit Test: Get Node By Id', () => {
  let uri
  let mongoClient
  let nodeGateway
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    nodeGateway = new NodeGateway(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await nodeGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('gets node when given valid id', async () => {
    const validNode: INode = {
      title: 'validNode',
      nodeId: '1',
      type: 'text',
      content: 'example text content',
      filePath: makeIFilePath(['1']),
    }
    const createResponse = await nodeGateway.createNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const getNodeByIdResp = await nodeGateway.getNodeById(validNode.nodeId)
    expect(getNodeByIdResp.success).toBeTruthy()
  })

  test('fails to get node when given invalid id', async () => {
    const validNode: INode = {
      title: 'validNode',
      nodeId: '1',
      type: 'text',
      content: 'example text content',
      filePath: makeIFilePath(['1']),
    }
    const createResponse = await nodeGateway.createNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const getNodeByIdResp = await nodeGateway.getNodeById('2')
    expect(getNodeByIdResp.success).toBeFalsy()
  })
})
