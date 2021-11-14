import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NodeGateway } from '../../../../nodes'
import { INode, makeINode } from '../../../../types'

describe('Unit Test: Delete All', () => {
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

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully deletes all root nodes', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await nodeGateway.createNode(validNode1)
    expect(response1.success).toBeTruthy()

    const validNode2: INode = makeINode('2', ['2'])
    const response2 = await nodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()

    const validNode3: INode = makeINode('3', ['2', '3'])
    const response3 = await nodeGateway.createNode(validNode3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await nodeGateway.deleteAll()
    expect(deleteAllResp.success).toBeTruthy()

    const findNode1Resp = await nodeGateway.getNodeById('1')
    expect(findNode1Resp.success).toBeFalsy()
    const findNode2Resp = await nodeGateway.getNodeById('2')
    expect(findNode2Resp.success).toBeFalsy()
    const findNode3Resp = await nodeGateway.getNodeById('3')
    expect(findNode3Resp.success).toBeFalsy()
  })

  test('successfully deletes all nested nodes', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await nodeGateway.createNode(validNode1)
    expect(response1.success).toBeTruthy()

    const validNode2: INode = makeINode('2', ['1', '2'])
    const response2 = await nodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()

    const validNode3: INode = makeINode('3', ['1', '2', '3'])
    const response3 = await nodeGateway.createNode(validNode3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await nodeGateway.deleteAll()
    expect(deleteAllResp.success).toBeTruthy()

    const findNode1Resp = await nodeGateway.getNodeById('1')
    expect(findNode1Resp.success).toBeFalsy()
    const findNode2Resp = await nodeGateway.getNodeById('2')
    expect(findNode2Resp.success).toBeFalsy()
    const findNode3Resp = await nodeGateway.getNodeById('3')
    expect(findNode3Resp.success).toBeFalsy()
  })

  test('successfully deletes nested and root nodes', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await nodeGateway.createNode(validNode1)
    expect(response1.success).toBeTruthy()

    const validNode2: INode = makeINode('2', ['2'])
    const response2 = await nodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()

    const validNode3: INode = makeINode('3', ['2', '3'])
    const response3 = await nodeGateway.createNode(validNode3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await nodeGateway.deleteAll()
    expect(deleteAllResp.success).toBeTruthy()

    const findNode1Resp = await nodeGateway.getNodeById('1')
    expect(findNode1Resp.success).toBeFalsy()
    const findNode2Resp = await nodeGateway.getNodeById('2')
    expect(findNode2Resp.success).toBeFalsy()
    const findNode3Resp = await nodeGateway.getNodeById('3')
    expect(findNode3Resp.success).toBeFalsy()
  })
})
