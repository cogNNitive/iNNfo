import { Ref } from 'vue'
import * as d3 from 'd3'
import { GNode, GEdge } from './useGraphData'

interface GraphRendererOptions {
  containerRef: Ref<HTMLDivElement | undefined>
  svgRef: Ref<SVGSVGElement | undefined>
  currentLayout: Ref<string>
  depthLimit: Ref<number>
  expandedNodes: Set<string>
  expansionSig: Ref<number>
  selectedNodeId: Ref<string>
  highlightedConcept: Ref<string>
  displayNodes: Ref<GNode[]>
  displayEdges: Ref<GEdge[]>
  getHexColor: (name: string) => string
  hslStr: (hex: string, satMult: number, lightOff: number) => string
  textColor: (bg: string) => string
  emit: (event: 'select-node', nodeId: string) => void
}

export function useGraphRenderer(options: GraphRendererOptions) {
  const {
    containerRef,
    svgRef,
    currentLayout,
    depthLimit,
    expandedNodes,
    expansionSig,
    selectedNodeId,
    highlightedConcept,
    displayNodes,
    displayEdges,
    getHexColor,
    hslStr,
    textColor,
    emit,
  } = options

  let resizeObs: ResizeObserver | null = null
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  let root: d3.Selection<SVGGElement, unknown, null, undefined>
  let sim: d3.Simulation<any, any> | null = null
  let forceLinkSel: d3.Selection<any, any, any, any> | null = null
  let forceNodeSel: d3.Selection<any, any, any, any> | null = null
  let forceEdgeG: d3.Selection<any, any, any, any> | null = null

  function initSvg() {
    if (!svgRef.value || !containerRef.value) return
    svg = d3.select(svgRef.value)
    svg.selectAll('*').remove()
    root = svg.append('g')
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 6])
      .on('zoom', (e) => root.attr('transform', e.transform))
    svg.call(zoom)
    resizeObs = new ResizeObserver(() => {
      if (svgRef.value)
        svg.attr('viewBox', `0 0 ${svgRef.value.clientWidth} ${svgRef.value.clientHeight}`)
    })
    resizeObs.observe(containerRef.value)
  }

  function getSelectionRoots(): string[] {
    if (highlightedConcept.value) {
      return displayNodes.value
        .filter((n) => n.concept === highlightedConcept.value && n.inst)
        .map((n) => n.id)
    }
    if (selectedNodeId.value) return [selectedNodeId.value]
    return []
  }

  function isNodeSelected(node: GNode): boolean {
    if (highlightedConcept.value) return node.concept === highlightedConcept.value && node.inst
    return node.id === selectedNodeId.value
  }

  function navigateToNode(node: GNode) {
    const nodeId = node.id.startsWith('inst:') ? node.id.slice(5) : node.id
    emit('select-node', nodeId)
  }

  function selectNode(node: GNode) {
    highlightedConcept.value = ''
    selectedNodeId.value = selectedNodeId.value === node.id ? '' : node.id
  }

  function clearSelection() {
    highlightedConcept.value = ''
    selectedNodeId.value = ''
  }

  function expandNode(id: string) {
    if (expandedNodes.has(id)) expandedNodes.delete(id)
    else expandedNodes.add(id)
    expansionSig.value++
  }

  function clearExpanded() {
    expandedNodes.clear()
    expansionSig.value++
  }

  function computeDepthSets(startIds: string[]) {
    const shown = new Set<string>()
    const depths = new Map<string, number>()
    const collapsible = new Set<string>()
    const queue: [string, number][] = startIds.map((id) => [id, 0])

    while (queue.length) {
      const [id, d] = queue.shift()!
      if (shown.has(id)) continue
      shown.add(id)
      depths.set(id, d)
      const effLimit = expandedNodes.has(id) ? depthLimit.value + 1 : depthLimit.value
      if (d >= effLimit) continue
      displayEdges.value.forEach((e) => {
        if (e.source === id && !shown.has(e.target)) queue.push([e.target, d + 1])
        if (e.target === id && !shown.has(e.source)) queue.push([e.source, d + 1])
      })
    }

    for (const [id, d] of depths) {
      const effLimit = expandedNodes.has(id) ? depthLimit.value + 1 : depthLimit.value
      if (d < effLimit) continue
      let hasHidden = false
      displayEdges.value.forEach((e) => {
        if (e.source === id && !shown.has(e.target)) hasHidden = true
        if (e.target === id && !shown.has(e.source)) hasHidden = true
      })
      if (hasHidden) collapsible.add(id)
    }

    return { shown, collapsible }
  }

  // ── d3 SVG helper functions ──
  function navIcon(
    parent: d3.Selection<any, any, any, any>,
    x: number,
    y: number,
    color: string,
    onClick: () => void,
    tooltip: string,
  ) {
    const g = parent
      .append('g')
      .attr('cursor', 'pointer')
      .attr('class', 'sn-nav')
      .attr('transform', `translate(${x},${y})`)
    g.append('circle')
      .attr('r', 7)
      .attr('fill', color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
    g.append('path')
      .attr('d', 'M-2.5,0 h5 M0,-2.5 l2.5,2.5 -2.5,2.5')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
    g.append('title').text(tooltip)
    g.on('click', (event: any) => {
      event.stopPropagation()
      onClick()
    })
    return g
  }

  function expandIcon(
    parent: d3.Selection<any, any, any, any>,
    x: number,
    y: number,
    color: string,
    expanded: boolean,
    onClick: () => void,
    tooltip: string,
  ) {
    const g = parent
      .append('g')
      .attr('cursor', 'pointer')
      .attr('class', 'sn-expand')
      .attr('transform', `translate(${x},${y})`)
    g.append('circle')
      .attr('r', 7)
      .attr('fill', expanded ? color : 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
    g.append('path')
      .attr('d', expanded ? 'M-3,0 h6' : 'M-3,0 h6 M0,-3 v6')
      .attr('stroke', expanded ? '#fff' : color)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
    g.append('title').text(tooltip)
    g.on('click', (event: any) => {
      event.stopPropagation()
      onClick()
    })
    return g
  }

  /* ─── SANKEY: concepts = colored column headers, instances = flow nodes ─── */
  function renderSankey() {
    const W = svgRef.value?.clientWidth || 900
    const primaryEdges = displayEdges.value.filter((e) => e.type !== 'taxonomy')
    const groups = d3.group(displayNodes.value, (n) => n.concept)
    let conceptOrder = [...groups.keys()]

    // Order concept columns (no hierarchyConcepts — use natural order then heuristic)
    const srcSet = new Set(
      primaryEdges
        .map((e) => displayNodes.value.find((n) => n.id === e.source)?.concept)
        .filter(Boolean),
    )
    const tgtSet = new Set(
      primaryEdges
        .map((e) => displayNodes.value.find((n) => n.id === e.target)?.concept)
        .filter(Boolean),
    )
    const mid = new Set(conceptOrder.filter((c) => srcSet.has(c) && tgtSet.has(c)))
    conceptOrder = [
      ...conceptOrder.filter((c) => srcSet.has(c) && !mid.has(c)),
      ...conceptOrder.filter((c) => mid.has(c)),
      ...conceptOrder.filter((c) => tgtSet.has(c) && !mid.has(c)),
      ...conceptOrder.filter((c) => !srcSet.has(c) && !tgtSet.has(c)),
    ]

    const cCount = conceptOrder.length
    if (cCount === 0) return

    const headerH = 32,
      padX = 40,
      instGapY = 34
    const slotW = (W - 2 * padX) / cCount
    const colW = Math.max(140, Math.min(220, slotW * 0.7))

    const contentStartX = padX

    const colInst = new Map<string, { y: number; h: number }[]>()
    const instPos = new Map<string, { x: number; y: number; w: number; h: number }>()

    conceptOrder.forEach((cname, ci) => {
      const insts = (groups.get(cname) || []).filter((n) => n.inst)
      const startY = 6 + headerH + 10
      const x = contentStartX + ci * slotW + (slotW - colW) / 2
      const w = colW
      const positions: { y: number; h: number }[] = []
      insts.forEach((n, i) => {
        const y = startY + i * instGapY
        const h = 22
        instPos.set(n.id, { x, y, w, h })
        positions.push({ y, h })
      })
      colInst.set(cname, positions)
    })

    // ── Draw flow lines (edges) between instances ──
    primaryEdges.forEach((e) => {
      const s = instPos.get(e.source),
        t = instPos.get(e.target)
      if (!s || !t) return
      const sx = s.x + s.w,
        sy = s.y + s.h / 2
      const tx = t.x,
        ty = t.y + t.h / 2
      const cpx = (sx + tx) / 2
      root
        .append('path')
        .attr('d', `M${sx},${sy} C${cpx},${sy} ${cpx},${ty} ${tx},${ty}`)
        .attr('fill', 'none')
        .attr('stroke', e.color)
        .attr('stroke-width', 2.5)
        .attr('stroke-opacity', 0.3)
        .attr('stroke-linecap', 'round')
        .attr('data-edge', '')
        .attr('data-source', e.source)
        .attr('data-target', e.target)
        .append('title')
        .text(`${e.label} (${e.type})`)
    })

    // ── Compute depth sets for selection highlighting and expand icons ──
    const selRoots = getSelectionRoots()
    let depthShown = new Set<string>()
    let collapsible = new Set<string>()
    if (selRoots.length > 0) {
      const ds = computeDepthSets(selRoots)
      depthShown = ds.shown
      collapsible = ds.collapsible
    }

    // ── Draw concept column headers and instance nodes ──
    conceptOrder.forEach((cname, ci) => {
      const x = contentStartX + ci * slotW + (slotW - colW) / 2
      const w = colW
      const baseColor = getHexColor(cname)
      const fill = hslStr(baseColor, 1, 0)

      const hdr = root.append('g').attr('cursor', 'pointer')
      hdr
        .append('rect')
        .attr('x', x - 2)
        .attr('y', 6)
        .attr('width', w + 4)
        .attr('height', headerH)
        .attr('rx', 6)
        .attr('fill', fill)

      const label = cname.length > 18 ? cname.slice(0, 16) + '\u2026' : cname
      hdr
        .append('text')
        .text(label.toUpperCase())
        .attr('x', x + w / 2)
        .attr('y', 6 + headerH / 2 + 3.5)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('font-weight', 700)
        .attr('fill', textColor(baseColor))
        .append('title')
        .text(cname)

      hdr.on('click', (event: any) => {
        event.stopPropagation()
        const insts = (groups.get(cname) || []).filter((n) => n.inst)
        if (insts.length > 0) selectNode(insts[0])
      })

      const insts = (groups.get(cname) || []).filter((n) => n.inst)
      const positions = colInst.get(cname) || []
      insts.forEach((n, i) => {
        const pos = positions[i]
        if (!pos) return
        const sel = isNodeSelected(n)
        const g = root.append('g').attr('cursor', 'pointer').attr('data-node', n.id)

        g.append('rect')
          .attr('x', x)
          .attr('y', pos.y)
          .attr('width', w)
          .attr('height', pos.h)
          .attr('rx', 4)
          .attr('fill', hslStr(n.color, 0.35, 0.35))
          .attr('stroke', n.color)
          .attr('stroke-width', sel ? 3 : 1.5)

        g.append('text')
          .text(n.label)
          .attr('x', x + 5)
          .attr('y', pos.y + pos.h / 2 + 3.5)
          .attr('font-size', 10)
          .attr('fill', '#1e293b')
          .attr('font-weight', sel ? 700 : 500)

        g.on('click', (event: any) => {
          event.stopPropagation()
          selectNode(n)
        })
        g.append('title').text(`${n.label} (${n.concept})`)

        let iy = 0
        if (n.id === selectedNodeId.value && !highlightedConcept.value) {
          navIcon(
            root,
            x + w + 3,
            pos.y + 4 + iy,
            n.color,
            () => navigateToNode(n),
            `Navigate to ${n.label}`,
          )
          iy += 18
        }
        if (collapsible.has(n.id)) {
          expandIcon(
            root,
            x + w + 3,
            pos.y + 4 + iy,
            n.color,
            expandedNodes.has(n.id),
            () => expandNode(n.id),
            expandedNodes.has(n.id) ? 'Collapse' : 'Expand',
          )
        }
      })
    })

    // Selection highlighting
    if (selectedNodeId.value) {
      root.selectAll('[data-node]').attr('opacity', function () {
        const id = d3.select(this).attr('data-node') as string
        return depthShown.has(id) ? 1 : 0.15
      })
      root.selectAll('[data-edge]').attr('stroke-opacity', function () {
        const s = d3.select(this).attr('data-source') as string
        const t = d3.select(this).attr('data-target') as string
        return depthShown.has(s) && depthShown.has(t) ? 0.7 : 0.03
      })
    }
  }

  /* ─── FORCE: concept nodes larger, instance nodes smaller, hover dims ─── */
  function renderForce() {
    const W = svgRef.value?.clientWidth || 900,
      H = svgRef.value?.clientHeight || 600
    const gData = {
      nodes: JSON.parse(JSON.stringify(displayNodes.value)),
      edges: JSON.parse(JSON.stringify(displayEdges.value)),
    }
    gData.nodes.forEach((n: any) => {
      n.x = W / 2 + (Math.random() - 0.5) * 300
      n.y = H / 2 + (Math.random() - 0.5) * 300
      n._active = true
    })

    const edgeG = root.append('g')
    const link = edgeG
      .selectAll('line')
      .data(gData.edges)
      .join('line')
      .attr('stroke', (d: any) => d.color)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.3)
      .attr('stroke-dasharray', (d: any) => (d.type === 'taxonomy' ? '4,3' : 'none'))

    const linkLabel = edgeG
      .selectAll('text')
      .data(gData.edges)
      .join('text')
      .attr('font-size', 10)
      .attr('fill', '#64748b')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .text((d: any) => d.label)

    const nodeG = root.append('g')
    const node = nodeG.selectAll('g').data(gData.nodes).join('g').attr('cursor', 'pointer')

    node
      .append('circle')
      .attr('r', (d: any) => (d.inst ? 16 : 28))
      .attr('fill', (d: any) => d.color)
      .attr('stroke', 'white')
      .attr('stroke-width', (d: any) => (d.inst ? 2 : 3))

    // Inner ring for concept nodes
    node.each(function (d: any) {
      if (!d.inst) {
        d3.select(this)
          .insert('circle', ':first-child')
          .attr('r', 22)
          .attr('fill', 'none')
          .attr('stroke', 'white')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.5)
      }
    })

    node
      .append('text')
      .text((d: any) => (d.label.length > 18 ? d.label.slice(0, 16) + '\u2026' : d.label))
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => (d.inst ? 3 : 4))
      .attr('font-size', (d: any) => (d.inst ? 10 : 11))
      .attr('font-weight', (d: any) => (d.inst ? 500 : 700))
      .attr('fill', (d: any) => textColor(d.color))
      .attr('pointer-events', 'none')

    node
      .append('title')
      .text(
        (d: any) => `${d.label} (${d.concept})${d.inst ? ' \u00B7 instance' : ' \u00B7 concept'}`,
      )

    // Hover: dim non-connected, highlight connected
    node
      .on('mouseenter', function (_e: any, d: any) {
        const connected = new Set([d.id])
        gData.edges.forEach((e: any) => {
          if (e.source.id === d.id) connected.add(e.target.id)
          if (e.target.id === d.id) connected.add(e.source.id)
        })
        nodeG.selectAll('g').each(function (n: any) {
          const el = d3.select(this)
          if (connected.has(n.id)) {
            el.attr('opacity', 1)
            el.select('circle')
              .attr('stroke-width', n.inst ? 3 : 4)
              .attr('stroke', n.inst ? d.color : '#fff')
          } else {
            el.attr('opacity', 0.25)
          }
        })
        edgeG
          .selectAll('line')
          .attr('stroke-opacity', (e: any) =>
            connected.has(e.source.id) && connected.has(e.target.id) ? 0.7 : 0.08,
          )
        edgeG
          .selectAll('text')
          .attr('opacity', (e: any) =>
            connected.has(e.source.id) && connected.has(e.target.id) ? 1 : 0.05,
          )
      })
      .on('mouseleave', function () {
        applyForceSelection()
      })

    node
      .call(
        d3
          .drag<any, any>()
          .on('start', (e, d: any) => {
            if (!e.active) sim?.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (e, d: any) => {
            d.fx = e.x
            d.fy = e.y
          })
          .on('end', (e, d: any) => {
            if (!e.active) sim?.alphaTarget(0)
            d.fx = null
            d.fy = null
          }),
      )
      .on('click', (event: any, d: any) => {
        event.stopPropagation()
        selectNode(d)
      })

    sim = d3
      .forceSimulation(gData.nodes)
      .force(
        'link',
        d3
          .forceLink(gData.edges)
          .id((d: any) => d.id)
          .distance(160)
          .strength(0.12),
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(36))
      .on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y)
        linkLabel
          .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
          .attr('y', (d: any) => (d.source.y + d.target.y) / 2)
        node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      })
    forceLinkSel = link
    forceNodeSel = node
    forceEdgeG = edgeG
  }

  function applyForceSelection() {
    const selId = selectedNodeId.value
    if (!forceNodeSel || !forceLinkSel) return

    forceNodeSel.selectAll('.sn-nav, .sn-expand').remove()

    if (!selId) {
      forceNodeSel.attr('opacity', 1)
      forceNodeSel
        .select('circle')
        .attr('stroke-width', (d: any) => (d.inst ? 2 : 3))
        .attr('stroke', 'white')
      forceNodeSel.select('text').attr('font-weight', (d: any) => (d.inst ? 500 : 700))
      forceLinkSel.attr('stroke-opacity', 0.3)
      forceEdgeG?.selectAll('text').attr('opacity', 1)
      return
    }

    const roots = getSelectionRoots()
    const { shown, collapsible } = computeDepthSets(roots.length > 0 ? roots : [selId])

    forceNodeSel.attr('opacity', (d: any) => (shown.has(d.id) ? 1 : 0.2))
    forceNodeSel.each(function (d: any) {
      const el = d3.select(this)
      const sel = isNodeSelected(d)
      el.select('text').attr('font-weight', sel ? 700 : d.inst ? 500 : 700)
      el.select('circle')
        .attr('stroke-width', sel ? (d.inst ? 4 : 5) : d.inst ? 2 : 3)
        .attr('stroke', sel ? d.color : 'white')
    })
    forceNodeSel.each(function (d: any) {
      const el = d3.select(this)
      const r = d.inst ? 16 : 28
      let oy = -r + 6
      if (d.id === selId && !highlightedConcept.value) {
        navIcon(el, r + 2, oy, d.color, () => navigateToNode(d), `Navigate to ${d.label}`)
        oy += 18
      }
      if (collapsible.has(d.id)) {
        expandIcon(
          el,
          r + 2,
          oy,
          d.color,
          expandedNodes.has(d.id),
          () => expandNode(d.id),
          expandedNodes.has(d.id) ? 'Collapse' : 'Expand',
        )
      }
    })
    forceLinkSel.attr('stroke-opacity', (d: any) =>
      shown.has(d.source.id) && shown.has(d.target.id) ? 0.7 : 0.05,
    )
    forceEdgeG
      ?.selectAll('text')
      .attr('opacity', (d: any) => (shown.has(d.source.id) && shown.has(d.target.id) ? 1 : 0.05))
  }

  function render() {
    if (!svgRef.value) return
    svg.selectAll('*').remove()
    root = svg.append('g')
    if (displayNodes.value.length === 0) return
    const W = svgRef.value.clientWidth || 900,
      H = svgRef.value.clientHeight || 600
    svg.attr('viewBox', `0 0 ${W} ${H}`)
    svg.on('click', () => clearSelection())
    switch (currentLayout.value) {
      case 'sankey':
        renderSankey()
        break
      case 'force':
        renderForce()
        break
    }
    // Auto-fit: scale to show all content with padding
    requestAnimationFrame(() => {
      try {
        const bounds = (root.node() as SVGGElement)?.getBBox()
        if (bounds && bounds.width > 0 && bounds.height > 0) {
          const pad = 50
          svg.attr(
            'viewBox',
            `${bounds.x - pad} ${bounds.y - pad} ${bounds.width + 2 * pad} ${bounds.height + 2 * pad}`,
          )
        }
      } catch (_) {
        /* ignore */
      }
    })
  }

  function stopSimulation() {
    if (sim) sim.stop()
  }

  function disconnectResizeObserver() {
    if (resizeObs) resizeObs.disconnect()
  }

  return {
    initSvg,
    render,
    applyForceSelection,
    clearSelection,
    selectNode,
    expandNode,
    clearExpanded,
    navigateToNode,
    stopSimulation,
    disconnectResizeObserver,
  }
}
