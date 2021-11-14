import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NodeGateway } from '../../../../nodes'
import { INode, makeIFilePath, makeINode } from '../../../../types'

describe('Unit Test: Create Node', () => {
  let uri: string
  let mongoClient: MongoClient
  let nodeGateway: NodeGateway
  let mongoMemoryServer: MongoMemoryServer

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

  test('inserts valid node', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const response = await nodeGateway.createNode(validNode)
    expect(response.success).toBeTruthy()
    expect(response.payload).toStrictEqual(validNode)
  })

  test('fails to insert node with duplicate id', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const validResponse = await nodeGateway.createNode(validNode)

    expect(validResponse.success).toBeTruthy()
    const invalidNode: INode = makeINode('1', ['1'])
    const invalidResponse = await nodeGateway.createNode(invalidNode)
    expect(invalidResponse.success).toBeFalsy()
  })

  test('inserts valid nested node', async () => {
    const parentNode: INode = makeINode('1', ['1'])
    const response = await nodeGateway.createNode(parentNode)
    expect(response.success).toBeTruthy()
    expect(response.payload).toStrictEqual(parentNode)

    const nestedNode: INode = makeINode('2', ['1', '2'])
    const nestedResponse = await nodeGateway.createNode(nestedNode)
    expect(nestedResponse.success).toBeTruthy()
    expect(nestedResponse.payload).toStrictEqual(nestedNode)

    const getParentResp = await nodeGateway.getNodeById('1')
    expect(
      getParentResp.payload.filePath.children.includes(nestedNode.nodeId)
    ).toBeTruthy()
    const getNestedResp = await nodeGateway.getNodeById('2')
    expect(getNestedResp.payload.filePath.path).toStrictEqual(nestedNode.filePath.path)
  })

  test(
    'fails to insert node when end of filePath does not equal ' + 'nodeId',
    async () => {
      const invalidNode: INode = makeINode('1', ['2'])
      const response = await nodeGateway.createNode(invalidNode)
      expect(response.success).toBeFalsy()
    }
  )

  test('fails to insert node when children is of invalid type', async () => {
    const invalidNode: INode = makeINode('1', ['2'], '')
    const response = await nodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when type is of invalid type', async () => {
    const invalidNode = makeINode('1', ['2'], undefined, 'ajdlfasd')
    const response = await nodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when title is of invalid type', async () => {
    const invalidNode = makeINode('1', ['2'], undefined, undefined, 1)
    const response = await nodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when content is not valid typed', async () => {
    const invalidNode = makeINode('1', ['2'], undefined, undefined, undefined, 0)
    const response = await nodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when fieldName is missing', async () => {
    const invalidNode = {
      title: 'invalidNode',
      nodeId: '1',
      type: 'text',
      filePath: makeIFilePath(['1']),
    }
    const response = await nodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when fieldName is misnamed', async () => {
    const invalidNode = {
      title: 'invalidNode',
      nodeId: '1',
      type: 'text',
      asdfasdf: '',
      filePath: makeIFilePath(['1']),
    }
    const response = await nodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert node when field value is mistyped', async () => {
    const invalidNode = {
      title: 'invalidNode',
      nodeId: '1',
      type: 'text',
      content: 1,
      filePath: makeIFilePath(['1']),
    }
    const response = await nodeGateway.createNode(invalidNode)
    expect(response.success).toBeFalsy()
  })
})
