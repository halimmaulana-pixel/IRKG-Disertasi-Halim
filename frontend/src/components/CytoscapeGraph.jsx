import { useRef, useEffect, useState } from "react";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";

cytoscape.use(coseBilkent);

const NODE_COLORS = {
  CPL:        { bg: "#003d7a", border: "#c8972a" },
  ESCO_SKILL: { bg: "#0891b2", border: "#0e7490" },
  ONET:       { bg: "#059669", border: "#047857" },
  SKKNI:      { bg: "#d97706", border: "#b45309" },
  ESCO_OCC:   { bg: "#7c3aed", border: "#6d28d9" },
};

const NODE_SHAPES = {
  CPL: "round-rectangle",
  ESCO_SKILL: "ellipse",
  ONET: "diamond",
  SKKNI: "hexagon",
  ESCO_OCC: "octagon",
};

export default function CytoscapeGraph({ elements, onNodeClick, onEdgeClick }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [graphError, setGraphError] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: "node",
          style: {
            "background-color": (e) => NODE_COLORS[e.data("node_type")]?.bg || "#64748b",
            "border-color": (e) => NODE_COLORS[e.data("node_type")]?.border || "#475569",
            "border-width": 2.5,
            "label": "data(label)",
            "font-size": "12px",
            "font-weight": 700,
            "font-family": "'Segoe UI Variable', 'Trebuchet MS', 'Segoe UI', sans-serif",
            "color": "#fff",
            "text-wrap": "wrap",
            "text-max-width": "130px",
            "text-outline-color": "#020617",
            "text-outline-width": 2.2,
            "text-background-color": "#020617",
            "text-background-opacity": 0.78,
            "text-background-padding": "4px 7px",
            "text-background-shape": "roundrectangle",
            "width": (e) => e.data("is_center") ? 94 : (e.data("node_type") === "CPL" ? 78 : 56),
            "height": (e) => e.data("is_center") ? 54 : (e.data("node_type") === "CPL" ? 42 : 56),
            "shape": (e) => NODE_SHAPES[e.data("node_type")] || "ellipse",
            "text-valign": "center",
            "text-halign": "center",
            "overlay-padding": "6px",
            "shadow-blur": 16,
            "shadow-opacity": 0.38,
            "shadow-color": "#0ea5e9",
            "shadow-offset-x": 0,
            "shadow-offset-y": 0,
            "min-zoomed-font-size": 10,
            "transition-property": "border-width, border-color, shadow-blur, shadow-opacity",
            "transition-duration": "140ms",
          },
        },
        {
          selector: "node[is_center]",
          style: {
            "border-width": 4,
            "border-color": "#f59e0b",
            "shadow-color": "#f59e0b",
            "shadow-blur": 24,
            "text-background-opacity": 0.92,
          },
        },
        {
          selector: "node[full_label = id]",
          style: {
            "border-style": "dashed",
            "border-color": "#f59e0b",
            "shadow-color": "#f59e0b",
          },
        },
        {
          selector: "node[cri_flag = 'COMPLETE']",
          style: { "border-color": "#22c55e" },
        },
        {
          selector: "node[cri_flag = 'PARTIAL']",
          style: { "border-color": "#f59e0b" },
        },
        {
          selector: "node[cri_flag = 'INCOMPLETE']",
          style: { "border-color": "#ef4444" },
        },
        {
          selector: "edge",
          style: {
            "width": (e) => e.data("width") || Math.max(1, (e.data("weight") || 0.5) * 3),
            "line-color": (e) => e.data("color") || (e.data("edge_type") === "MAPS_TO" ? "#c8972a" : "#475569"),
            "target-arrow-color": (e) => e.data("color") || "#c8972a",
            "target-arrow-shape": (e) => e.data("edge_type") === "MAPS_TO" ? "triangle" : "none",
            "curve-style": "unbundled-bezier",
            "control-point-distances": 20,
            "control-point-weights": 0.5,
            "label": (e) => {
              if (e.data("edge_type") === "MAPS_TO") {
                return e.data("label") || "";
              }
              return "";
            },
            "font-size": "10px",
            "font-weight": 700,
            "font-family": "'Cascadia Mono', 'Consolas', monospace",
            "color": "#cbd5e1",
            "text-background-color": "#0a1120",
            "text-background-opacity": 0.82,
            "text-background-padding": "3px",
            "text-margin-y": -4,
            "text-rotation": "autorotate",
            "line-cap": "round",
            "arrow-scale": 1.1,
            "opacity": 0.9,
            "min-zoomed-font-size": 11,
            "line-style": (e) => e.data("edge_type") === "BROADER" ? "dashed" : "solid",
            "overlay-padding": "4px",
          },
        },
        {
          selector: "edge[edge_type = 'BROADER']",
          style: {
            "line-color": "#94a3b8",
            "target-arrow-shape": "none",
            "curve-style": "haystack",
            "line-dash-pattern": [7, 5],
            "opacity": 0.72,
          },
        },
        {
          selector: "edge[edge_type = 'RELATED']",
          style: {
            "line-color": "#64748b",
            "target-arrow-shape": "none",
            "curve-style": "haystack",
            "opacity": 0.6,
          },
        },
        {
          selector: "edge[edge_type = 'MAPS_TO']",
          style: {
            "line-color": "#f59e0b",
            "target-arrow-color": "#f59e0b",
            "target-arrow-shape": "triangle-backcurve",
            "source-arrow-shape": "none",
            "curve-style": "bezier",
            "line-style": "solid",
            "line-dash-pattern": [12, 0],
            "opacity": 0.95,
          },
        },
        {
          selector: ":selected",
          style: {
            "border-width": 5,
            "border-color": "#f8fafc",
            "shadow-blur": 28,
            "shadow-color": "#f8fafc",
            "shadow-opacity": 0.45,
          },
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#f8fafc",
            "target-arrow-color": "#f8fafc",
            "width": 5,
          },
        },
        {
          selector: "node[domain_status = 'core']",
          style: { "border-color": "#0284c7", "border-width": 3.5 },
        },
        {
          selector: "node[domain_status = 'adjacent']",
          style: { "border-color": "#0891b2", "border-width": 2.5 },
        },
        {
          selector: "node[domain_status = 'outside']",
          style: { "opacity": 0.65, "border-style": "dashed" },
        },
      ],
      layout: { name: "cose-bilkent", fit: true, padding: 34 },
      minZoom: 0.1,
      maxZoom: 4,
      wheelSensitivity: 0.22,
    });

    cyRef.current = cy;

    cy.on("tap", "node", (e) => {
      onNodeClick && onNodeClick(e.target.data());
    });
    cy.on("tap", "edge", (e) => {
      onEdgeClick && onEdgeClick(e.target.data());
    });

    cy.on("mouseover", "node", () => {
      containerRef.current.style.cursor = "pointer";
    });
    cy.on("mouseout", "node", () => {
      containerRef.current.style.cursor = "default";
    });

    return () => cy.destroy();
  }, []);

  useEffect(() => {
    if (!cyRef.current || !elements.length) return;
    
    const cy = cyRef.current;
    cy.elements().remove();
    setGraphError("");
    try {
      const nodeMap = new Map();
      const edgeMap = new Map();

      for (const el of elements) {
        if (!el?.data?.id) continue;
        const isEdge = Object.prototype.hasOwnProperty.call(el.data, "source");
        if (isEdge) {
          edgeMap.set(el.data.id, el);
        } else {
          nodeMap.set(el.data.id, el);
        }
      }

      // Keep only edges whose endpoints exist after dedupe.
      const cleanedEdges = [];
      for (const e of edgeMap.values()) {
        if (nodeMap.has(e.data.source) && nodeMap.has(e.data.target)) {
          cleanedEdges.push(e);
        }
      }

      cy.add([...nodeMap.values(), ...cleanedEdges]);
    
      const layout = cy.layout({
        name: "cose-bilkent",
        idealEdgeLength: 118,
        nodeRepulsion: 6500,
        edgeElasticity: 0.38,
        nestingFactor: 0.1,
        gravity: 0.22,
        numIter: 2800,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
        animate: true,
        animationDuration: 620,
        fit: true,
      });
      layout.run();
    } catch (err) {
      const msg = err?.message || "Failed to render graph elements.";
      setGraphError(msg);
      console.error("[CytoscapeGraph]", err);
    }
  }, [elements]);

  return (
    <div className="w-full h-full relative">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(14,165,233,0.08), transparent 32%), radial-gradient(circle at 78% 85%, rgba(245,158,11,0.08), transparent 28%), linear-gradient(180deg, rgba(2,6,23,0.88), rgba(3,7,18,0.98))",
        }}
      />
      <div ref={containerRef} className="w-full h-full relative" />
      {graphError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-bg2 border border-red-500/30 text-red-300 text-xs rounded px-3 py-2">
            Graph render error: {graphError}
          </div>
        </div>
      )}
    </div>
  );
}
