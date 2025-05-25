import * as d3 from 'd3';

export interface DiagramNode {
  id: string;
  type: 'actor' | 'component' | 'database' | 'cloud' | 'interface';
  label: string;
  x: number;
  y: number;
  fx?: number;
  fy?: number;
}

export interface DiagramLink {
  source: string;
  target: string;
  label?: string;
}

export interface DiagramVersion {
  id: string;
  name: string;
  nodes: DiagramNode[];
  links: DiagramLink[];
  timestamp: Date;
}

export class DiagramVersionManager {
  private versions: DiagramVersion[] = [];
  private currentVersionId: string | null = null;

  saveVersion(name: string, nodes: DiagramNode[], links: DiagramLink[]): string {
    const version: DiagramVersion = {
      id: Date.now().toString(),
      name,
      nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
      links: JSON.parse(JSON.stringify(links)),
      timestamp: new Date()
    };

    this.versions.push(version);
    this.currentVersionId = version.id;
    
    // Keep only last 10 versions
    if (this.versions.length > 10) {
      this.versions = this.versions.slice(-10);
    }

    return version.id;
  }

  getVersions(): DiagramVersion[] {
    return [...this.versions];
  }

  loadVersion(versionId: string): DiagramVersion | null {
    const version = this.versions.find(v => v.id === versionId);
    if (version) {
      this.currentVersionId = versionId;
      return {
        ...version,
        nodes: JSON.parse(JSON.stringify(version.nodes)),
        links: JSON.parse(JSON.stringify(version.links))
      };
    }
    return null;
  }

  getCurrentVersionId(): string | null {
    return this.currentVersionId;
  }

  deleteVersion(versionId: string): boolean {
    const index = this.versions.findIndex(v => v.id === versionId);
    if (index > -1) {
      this.versions.splice(index, 1);
      if (this.currentVersionId === versionId) {
        this.currentVersionId = this.versions.length > 0 ? this.versions[this.versions.length - 1].id : null;
      }
      return true;
    }
    return false;
  }

  compareVersions(version1Id: string, version2Id: string) {
    const v1 = this.versions.find(v => v.id === version1Id);
    const v2 = this.versions.find(v => v.id === version2Id);
    
    if (!v1 || !v2) return null;

    const comparison = {
      nodesAdded: v2.nodes.filter(n2 => !v1.nodes.find(n1 => n1.id === n2.id)),
      nodesRemoved: v1.nodes.filter(n1 => !v2.nodes.find(n2 => n2.id === n1.id)),
      nodesMoved: v2.nodes.filter(n2 => {
        const n1 = v1.nodes.find(n1 => n1.id === n2.id);
        return n1 && (Math.abs(n1.x - n2.x) > 5 || Math.abs(n1.y - n2.y) > 5);
      }),
      linksAdded: v2.links.filter(l2 => !v1.links.find(l1 => l1.source === l2.source && l1.target === l2.target)),
      linksRemoved: v1.links.filter(l1 => !v2.links.find(l2 => l2.source === l1.source && l2.target === l1.target))
    };

    return comparison;
  }
}

export const diagramThemes = {
  default: {
    actor: { fill: '#3B82F6', stroke: '#1D4ED8' },
    component: { fill: '#10B981', stroke: '#047857' },
    database: { fill: '#F59E0B', stroke: '#D97706' },
    cloud: { fill: '#8B5CF6', stroke: '#7C3AED' },
    interface: { fill: '#EF4444', stroke: '#DC2626' },
    link: { stroke: '#4B5563' },
    text: { fill: '#ffffff' }
  },
  dark: {
    actor: { fill: '#1F2937', stroke: '#374151' },
    component: { fill: '#374151', stroke: '#4B5563' },
    database: { fill: '#4B5563', stroke: '#6B7280' },
    cloud: { fill: '#6B7280', stroke: '#9CA3AF' },
    interface: { fill: '#9CA3AF', stroke: '#D1D5DB' },
    link: { stroke: '#6B7280' },
    text: { fill: '#D1D5DB' }
  },
  colorful: {
    actor: { fill: '#EC4899', stroke: '#BE185D' },
    component: { fill: '#06B6D4', stroke: '#0891B2' },
    database: { fill: '#84CC16', stroke: '#65A30D' },
    cloud: { fill: '#F97316', stroke: '#EA580C' },
    interface: { fill: '#8B5CF6', stroke: '#7C3AED' },
    link: { stroke: '#64748B' },
    text: { fill: '#ffffff' }
  }
};

export function exportDiagramAsSVG(svgElement: SVGSVGElement, filename: string = 'diagram.svg') {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  
  // Add XML declaration and proper styling
  const fullSvgString = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${svgString}`;

  const blob = new Blob([fullSvgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

export function exportDiagramAsPNG(svgElement: SVGSVGElement, filename: string = 'diagram.png', scale: number = 2) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const img = new Image();
  
  img.onload = () => {
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };
  
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  img.src = url;
}