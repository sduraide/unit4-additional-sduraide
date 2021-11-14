import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NodeGateway } from '../../../../nodes'
import { INode, makeINode } from '../../../../types'

describe('Unit Test: Delete Node By Id', () => {
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

  test('deletes node with no children and no parent', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await nodeGateway.createNode(validNode1)
    expect(response1.success).toBeTruthy()

    const deleteResp = await nodeGateway.deleteNode('1')
    expect(deleteResp.success).toBeTruthy()
    const getResp = await nodeGateway.getNodeById('1')
    expect(getResp.success).toBeFalsy()
  })

  test('deletes node with children', async () => {
    const validNode2: INode = makeINode('2', ['2'])
    const response2 = await nodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()
    const validNode3: INode = makeINode('3', ['2', '3'])
    const response3 = await nodeGateway.createNode(validNode3)
    expect(response3.success).toBeTruthy()
    const validNode4: INode = makeINode('4', ['2', '4'])
    const response4 = await nodeGateway.createNode(validNode4)
    expect(response4.success).toBeTruthy()

    const deleteResp = await nodeGateway.deleteNode('2')
    expect(deleteResp.success).toBeTruthy()
    const get2Resp = await nodeGateway.getNodeById('2')
    expect(get2Resp.success).toBeFalsy()
    const get3Resp = await nodeGateway.getNodeById('3')
    expect(get3Resp.success).toBeFalsy()
    const get4Resp = await nodeGateway.getNodeById('4')
    expect(get4Resp.success).toBeFalsy()
  })

  test('deletes node with grandchildren', async () => {
    const validNode2: INode = makeINode('2', ['2'])
    const response2 = await nodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()
    const validNode3: INode = makeINode('3', ['2', '3'])
    const response3 = await nodeGateway.createNode(validNode3)
    expect(response3.success).toBeTruthy()
    const validNode4: INode = makeINode('4', ['2', '4'])
    const response4 = await nodeGateway.createNode(validNode4)
    expect(response4.success).toBeTruthy()
    const validNode5: INode = makeINode('5', ['2', '3', '5'])
    const response5 = await nodeGateway.createNode(validNode5)
    expect(response5.success).toBeTruthy()
    const deleteResp = await nodeGateway.deleteNode('2')

    expect(deleteResp.success).toBeTruthy()
    const get2Resp = await nodeGateway.getNodeById('2')
    expect(get2Resp.success).toBeFalsy()
    const get3Resp = await nodeGateway.getNodeById('3')
    expect(get3Resp.success).toBeFalsy()
    const get4Resp = await nodeGateway.getNodeById('4')
    expect(get4Resp.success).toBeFalsy()
    const get5Resp = await nodeGateway.getNodeById('5')
    expect(get5Resp.success).toBeFalsy()
  })

  test('deletes node with parent and children', async () => {
    // make sure the parent's 'child' field is updated (WORKS!)
    const validNode2: INode = makeINode('2', ['2'])
    const response2 = await nodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()
    const validNode3: INode = makeINode('3', ['2', '3'])
    const response3 = await nodeGateway.createNode(validNode3)
    expect(response3.success).toBeTruthy()
    const validNode4: INode = makeINode('4', ['2', '4'])
    const response4 = await nodeGateway.createNode(validNode4)
    expect(response4.success).toBeTruthy()
    const validNode5: INode = makeINode('5', ['2', '3', '5'])
    const response5 = await nodeGateway.createNode(validNode5)
    expect(response5.success).toBeTruthy()
    const deleteResp = await nodeGateway.deleteNode('3')
    expect(deleteResp.success).toBeTruthy()

    const get3Resp = await nodeGateway.getNodeById('3')
    expect(get3Resp.success).toBeFalsy()
    const get4Resp = await nodeGateway.getNodeById('4')
    expect(get4Resp.success).toBeTruthy()
    const get5Resp = await nodeGateway.getNodeById('5')
    expect(get5Resp.success).toBeFalsy()
    const get2Resp = await nodeGateway.getNodeById('2')
    expect(get2Resp.success).toBeTruthy()
    expect(get2Resp.payload.filePath.children.includes('4')).toBeTruthy()
    expect(get2Resp.payload.filePath.children.includes('3')).toBeFalsy()
  })

  test('fails to delete node when node id does not exist', async () => {
    const validNode2: INode = makeINode('1', ['1'])
    const response2 = await nodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()
    const deleteResp = await nodeGateway.deleteNode('2')
    expect(deleteResp.success).toBeFalsy()
  })
})
