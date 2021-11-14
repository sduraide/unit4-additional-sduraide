import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NodeGateway } from '../../../../nodes'
import {
  INode,
  isSameFilePath,
  isSameNode,
  makeIFilePath,
  makeINode,
} from '../../../../types'

describe('Unit Test: Move Node', () => {
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
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await nodeGateway.createNode(validNode1)
    expect(response1.success).toBeTruthy()
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
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('Valid move node', async () => {
    const moveNodeResp = await nodeGateway.moveNode('3', '1')
    expect(moveNodeResp.success).toBeTruthy()
    expect(
      isSameNode(makeINode('3', ['1', '3'], ['5']), moveNodeResp.payload)
    ).toBeTruthy()
    const getTreeResp = await nodeGateway.getTreeByRoot('1')
    expect(getTreeResp.success).toBeTruthy()
    const wrapper1 = getTreeResp.payload
    expect(wrapper1.children.length).toBe(1)
    const wrapper3 = wrapper1.children.find((wrapper) => wrapper.node.nodeId === '3')
    expect(wrapper3.children.length).toBe(1)
    const wrapper5 = wrapper3.children.find((wrapper) => wrapper.node.nodeId === '5')
    expect(wrapper5.children.length).toBe(0)
  })

  test('Valid move node to root', async () => {
    const moveNodeResp = await nodeGateway.moveNode('3', '~')
    expect(moveNodeResp.success).toBeTruthy()
    expect(isSameNode(makeINode('3', ['3'], ['5']), moveNodeResp.payload)).toBeTruthy()
    const getRootsResp = await nodeGateway.getRoots()
    expect(getRootsResp.success).toBeTruthy()
    expect(getRootsResp.payload.length).toBe(3)
  })

  test('Failed to move node to become a descendant of ' + 'it\'s children', async () => {
    const moveNodeResp = await nodeGateway.moveNode('3', '5')
    expect(moveNodeResp.success).toBeFalsy()
  })

  test('Cannot move node to be a parent of itself', async () => {
    const moveNodeResp = await nodeGateway.moveNode('3', '3')
    expect(moveNodeResp.success).toBeFalsy()
    const getNodeResp = await nodeGateway.getNodeById('3')
    expect(
      isSameFilePath(getNodeResp.payload.filePath, makeIFilePath(['2', '3'], ['5']))
    ).toBeTruthy()
  })

  test('Failure reponse sent when move not needed', async () => {
    const moveNodeResp = await nodeGateway.moveNode('3', '2')
    expect(moveNodeResp.success).toBeFalsy()
    const getNodeResp = await nodeGateway.getNodeById('3')
    expect(
      isSameFilePath(getNodeResp.payload.filePath, makeIFilePath(['2', '3'], ['5']))
    ).toBeTruthy()
  })
})
