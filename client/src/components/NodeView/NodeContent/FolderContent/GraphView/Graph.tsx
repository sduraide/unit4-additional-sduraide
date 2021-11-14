import { INode, ILink } from '../../../../../types'
import { useSigma } from 'react-sigma-v2'
import { useEffect } from 'react'
import chroma from 'chroma-js'
import 'react-sigma-v2/lib/react-sigma-v2.css'

/* Props for displaying the graph */
export interface IGraphProps {
  childNodes: INode[]
  links: Set<ILink>
}

/* Class to display the graph which takes in props of IGraphProps */
export const Graph = (props: IGraphProps) => {
  const { childNodes, links } = props

  const sigma = useSigma()
  const graph = sigma.getGraph()

  const loadGraph = () => {
    let x = 0
    let y = 0

    // add all the nodes to the graph first
    childNodes.forEach((node) => {
      if (!graph.nodes().includes(node.nodeId)) {
        graph.addNode(node.nodeId, {
          label: node.title,
          x: Math.random() * 401,
          y: Math.random() * 501,
          color: chroma.random().hex(),
          size: 10,
        })
        x = x + 1
        y = y + 1
      }
    })

    // add edges to the graph
    links.forEach((link) => {
      graph.addEdge(link.anchor1NodeId, link.anchor2NodeId, { color: '#CCC', size: 2 })
    })
  }

  useEffect(() => {
    loadGraph()
  }, [links])

  return null
}
