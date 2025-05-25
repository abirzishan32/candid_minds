"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Download, RefreshCw, Edit, ZoomIn, ZoomOut, Move, 
  History, Palette, GitBranch, Eye, EyeOff, Plus
} from 'lucide-react';
import { DiagramVersionManager, diagramThemes, exportDiagramAsSVG } from '@/lib/d3-utils';

interface DiagramNode {
    id: string;
    type: 'actor' | 'component' | 'database' | 'cloud' | 'interface';
    label: string;
    x: number;
    y: number;
    fx?: number;
    fy?: number;
}

interface DiagramLink {
    source: string;
    target: string;
    label?: string;
}

interface InteractiveDiagramProps {
    plantUML: string;
    onSave?: (nodes: DiagramNode[], links: DiagramLink[]) => void;
    onEdit?: (nodeId: string, newLabel: string) => void;
}

export function InteractiveDiagram({ plantUML, onSave, onEdit }: InteractiveDiagramProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [nodes, setNodes] = useState<DiagramNode[]>([]);
    const [links, setLinks] = useState<DiagramLink[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [theme, setTheme] = useState<keyof typeof diagramThemes>('default');
    const [showVersions, setShowVersions] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showLabels, setShowLabels] = useState(true);
    const [versionManager] = useState(new DiagramVersionManager());

    // Parse PlantUML to extract nodes and relationships
    const parsePlantUML = (plantUMLCode: string) => {
        const parsedNodes: DiagramNode[] = [];
        const parsedLinks: DiagramLink[] = [];

        const lines = plantUMLCode.split('\n');
        let nodeId = 0;

        lines.forEach((line, index) => {
            line = line.trim();

            // Parse actors
            if (line.includes('actor ')) {
                const match = line.match(/actor\s+"([^"]+)"\s+as\s+(\w+)/);
                if (match) {
                    parsedNodes.push({
                        id: match[2],
                        type: 'actor',
                        label: match[1],
                        x: 100 + Math.random() * 200,
                        y: 100 + Math.random() * 200
                    });
                }
            }

            // Parse components
            if (line.includes('[') && line.includes(']')) {
                const match = line.match(/\[([^\]]+)\]\s+as\s+(\w+)/);
                if (match) {
                    parsedNodes.push({
                        id: match[2],
                        type: 'component',
                        label: match[1],
                        x: 300 + Math.random() * 300,
                        y: 150 + Math.random() * 300
                    });
                }
            }

            // Parse databases
            if (line.includes('database ')) {
                const match = line.match(/database\s+"([^"]+)"\s+as\s+(\w+)/);
                if (match) {
                    parsedNodes.push({
                        id: match[2],
                        type: 'database',
                        label: match[1],
                        x: 500 + Math.random() * 200,
                        y: 100 + Math.random() * 200
                    });
                }
            }

            // Parse cloud services
            if (line.includes('cloud ')) {
                const match = line.match(/cloud\s+"([^"]+)"\s+as\s+(\w+)/);
                if (match) {
                    parsedNodes.push({
                        id: match[2],
                        type: 'cloud',
                        label: match[1],
                        x: 200 + Math.random() * 400,
                        y: 350 + Math.random() * 100
                    });
                }
            }

            // Parse relationships
            if (line.includes('-->')) {
                const match = line.match(/(\w+)\s+-->\s+(\w+)(?:\s*:\s*(.+))?/);
                if (match) {
                    parsedLinks.push({
                        source: match[1],
                        target: match[2],
                        label: match[3]?.trim()
                    });
                }
            }
        });

        // If no nodes were parsed, create default ones
        if (parsedNodes.length === 0) {
            const defaultNodes: DiagramNode[] = [
                { id: 'user', type: 'actor', label: 'User', x: 100, y: 200 },
                { id: 'frontend', type: 'component', label: 'Frontend', x: 300, y: 200 },
                { id: 'backend', type: 'component', label: 'Backend', x: 500, y: 200 },
                { id: 'database', type: 'database', label: 'Database', x: 700, y: 200 }
            ];

            const defaultLinks: DiagramLink[] = [
                { source: 'user', target: 'frontend', label: 'requests' },
                { source: 'frontend', target: 'backend', label: 'API calls' },
                { source: 'backend', target: 'database', label: 'queries' }
            ];

            return { nodes: defaultNodes, links: defaultLinks };
        }

        return { nodes: parsedNodes, links: parsedLinks };
    };

    // Initialize D3 simulation
    useEffect(() => {
        const { nodes: parsedNodes, links: parsedLinks } = parsePlantUML(plantUML);
        setNodes(parsedNodes);
        setLinks(parsedLinks);
    }, [plantUML]);

    // D3 rendering effect
    useEffect(() => {
        if (!svgRef.current || nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 800;
        const height = 600;

        // Create zoom behavior
        const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                const { transform } = event;
                setZoom(transform.k);
                g.attr('transform', transform);
            });

        svg.call(zoomBehavior);

        const g = svg.append('g');

        // Create force simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(60));

        // Create links
        const link = g.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', '#4B5563')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrowhead)');

        // Create link labels
        const linkLabel = g.append('g')
            .selectAll('text')
            .data(links)
            .join('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#9CA3AF')
            .attr('dy', -5)
            .text((d: any) => d.label || '');

        // Create nodes
        const node = g.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('cursor', 'pointer')
            .call(d3.drag<SVGGElement, DiagramNode>()
                .on('start', (event, d) => {
                    setIsDragging(true);
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    setIsDragging(false);
                    if (!event.active) simulation.alphaTarget(0);
                    if (!isEditMode) {
                        d.fx = null;
                        d.fy = null;
                    }
                }));

        // Add node shapes based on type
        node.each(function (d) {
            const nodeGroup = d3.select(this);

            switch (d.type) {
                case 'actor':
                    nodeGroup.append('circle')
                        .attr('r', 25)
                        .attr('fill', '#3B82F6')
                        .attr('stroke', '#1D4ED8')
                        .attr('stroke-width', 2);
                    break;
                case 'component':
                    nodeGroup.append('rect')
                        .attr('width', 100)
                        .attr('height', 50)
                        .attr('x', -50)
                        .attr('y', -25)
                        .attr('rx', 8)
                        .attr('fill', '#10B981')
                        .attr('stroke', '#047857')
                        .attr('stroke-width', 2);
                    break;
                case 'database':
                    nodeGroup.append('ellipse')
                        .attr('cx', 0)
                        .attr('cy', 0)
                        .attr('rx', 40)
                        .attr('ry', 25)
                        .attr('fill', '#F59E0B')
                        .attr('stroke', '#D97706')
                        .attr('stroke-width', 2);
                    break;
                case 'cloud':
                    nodeGroup.append('circle')
                        .attr('r', 30)
                        .attr('fill', '#8B5CF6')
                        .attr('stroke', '#7C3AED')
                        .attr('stroke-width', 2);
                    break;
                default:
                    nodeGroup.append('rect')
                        .attr('width', 80)
                        .attr('height', 40)
                        .attr('x', -40)
                        .attr('y', -20)
                        .attr('rx', 5)
                        .attr('fill', '#6B7280')
                        .attr('stroke', '#374151')
                        .attr('stroke-width', 2);
            }

            // Add node labels
            nodeGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', 5)
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', 'white')
                .text(d.label);
        });

        // Add selection highlight
        node.on('click', (event, d) => {
            setSelectedNode(selectedNode === d.id ? null : d.id);

            // Highlight selected node
            node.selectAll('rect, circle, ellipse')
                .attr('stroke-width', (nodeData: any) =>
                    nodeData.id === d.id ? 4 : 2
                )
                .attr('filter', (nodeData: any) =>
                    nodeData.id === d.id ? 'url(#glow)' : null
                );
        });

        // Add arrow marker
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 13)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 13)
            .attr('markerHeight', 13)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#4B5563')
            .style('stroke', 'none');

        // Add glow filter
        const defs = svg.select('defs');
        const filter = defs.append('filter').attr('id', 'glow');
        filter.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'coloredBlur');
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Update positions on tick
        simulation.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            linkLabel
                .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
                .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

            node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        });

        return () => {
            simulation.stop();
        };
    }, [nodes, links, isEditMode, selectedNode]);

    const handleSave = () => {
        if (onSave) {
            onSave(nodes, links);
        }
    };

    const handleSaveVersion = () => {
        const versionName = `Version ${new Date().toLocaleTimeString()}`;
        versionManager.saveVersion(versionName, nodes, links);
        if (onSave) {
            onSave(nodes, links);
        }
    };

    const handleLoadVersion = (versionId: string) => {
        const version = versionManager.loadVersion(versionId);
        if (version) {
            setNodes(version.nodes);
            setLinks(version.links);
        }
    };


    const handleThemeChange = (newTheme: keyof typeof diagramThemes) => {
        setTheme(newTheme);
        // Re-render with new theme
    };

    const handleAddNode = () => {
        const newNode: DiagramNode = {
            id: `node_${Date.now()}`,
            type: 'component',
            label: 'New Component',
            x: 400 + Math.random() * 200,
            y: 300 + Math.random() * 200
        };
        setNodes([...nodes, newNode]);
    };

    const handleDownload = () => {
        const svg = svgRef.current;
        if (!svg) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'system-design-interactive.svg';
        link.click();

        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        const { nodes: parsedNodes, links: parsedLinks } = parsePlantUML(plantUML);
        setNodes(parsedNodes);
        setLinks(parsedLinks);
        setSelectedNode(null);
    };

    const handleZoomIn = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().call(
            d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
            1.2
        );
    };

    const handleZoomOut = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().call(
            d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
            1 / 1.2
        );
    };

    return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden"
    >
      {/* Enhanced Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300 bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Interactive Mode
          </span>
          {selectedNode && (
            <span className="text-xs text-blue-300 bg-blue-900/50 px-2 py-1 rounded backdrop-blur-sm">
              Selected: {nodes.find(n => n.id === selectedNode)?.label}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1">
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as keyof typeof diagramThemes)}
              className="bg-transparent text-white text-xs border-none outline-none"
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="colorful">Colorful</option>
            </select>
          </div>

          {/* View Options */}
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-1.5 rounded transition-colors ${
                showLabels ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title={showLabels ? 'Hide Labels' : 'Show Labels'}
            >
              {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            
            <button
              onClick={() => setShowVersions(!showVersions)}
              className={`p-1.5 rounded transition-colors ${
                showVersions ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Version History"
            >
              <History className="w-3 h-3" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3 text-white" />
            </button>
            <span className="text-xs text-white px-2 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3 text-white" />
            </button>
          </div>

          {/* Action Controls */}
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={handleAddNode}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors text-green-400"
              title="Add Component"
            >
              <Plus className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-1.5 rounded transition-colors ${
                isEditMode ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
              }`}
              title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
            >
              {isEditMode ? <Move className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
            </button>
            
            <button
              onClick={handleReset}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
              title="Reset Layout"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
            
            <button
              onClick={handleSaveVersion}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
              title="Save Version"
            >
              <Save className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => svgRef.current && exportDiagramAsSVG(svgRef.current)}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
              title="Download SVG"
            >
              <Download className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Version History Sidebar */}
      <AnimatePresence>
        {showVersions && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-16 right-4 w-64 bg-black/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4 z-20 max-h-96 overflow-y-auto"
          >
            <h4 className="text-white font-semibold mb-3">Version History</h4>
            <div className="space-y-2">
              {versionManager.getVersions().map((version) => (
                <button
                  key={version.id}
                  onClick={() => handleLoadVersion(version.id)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    versionManager.getCurrentVersionId() === version.id
                      ? 'bg-blue-600/30 text-blue-300'
                      : 'hover:bg-gray-700/50 text-gray-300'
                  }`}
                >
                  <div className="font-medium">{version.name}</div>
                  <div className="text-xs text-gray-500">
                    {version.timestamp.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Canvas */}
      <div className="p-4 pt-16 bg-gray-950/30 min-h-[600px]">
        <svg
          ref={svgRef}
          width="100%"
          height="600"
          className="border border-gray-700 rounded-lg bg-gray-900/50"
        />
      </div>

      {/* Enhanced Instructions */}
      <div className="border-t border-gray-700 p-4 bg-gray-800/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h5 className="text-gray-300 font-medium mb-2">Controls</h5>
            <div className="space-y-1">
              <span>💡 Click nodes to select</span>
              <span>🖱️ Drag to reposition</span>
              <span>🔧 Edit mode: Lock positions</span>
              <span>➕ Add new components</span>
            </div>
          </div>
          <div>
            <h5 className="text-gray-300 font-medium mb-2">Features</h5>
            <div className="space-y-1">
              <span>🎨 Multiple themes</span>
              <span>📁 Version control</span>
              <span>💾 Export as SVG/PNG</span>
              <span>👁️ Toggle labels</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
          <div className="flex items-center gap-4">
            <span>{nodes.length} components</span>
            <span>{links.length} connections</span>
            <span>Theme: {theme}</span>
          </div>
          <div className="text-xs">
            Last saved: {versionManager.getCurrentVersionId() ? 'Recently' : 'Never'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}