import React from "react";
import PropTypes from "prop-types";
import * as d3Scale from "d3-scale";

const Axis = ({ x, endX, y, startVal, endVal, ticks }) => {
  const tickSize = 5;

  const xScale = d3Scale.scaleLinear().domain([startVal, endVal]);
  xScale.range([x, endX]);
  const tickValues = xScale.ticks(ticks);

  return (
    <g fill="none" className="unselectable axis">
      <text x={(x + endX) / 2} y={y - tickSize}>
        Time
      </text>
      <line stroke="#000" strokeWidth="1" x1={x} x2={endX} y1={y} y2={y} />
      {tickValues.map(value => (
        <line
          key={value}
          stroke="#000"
          strokeWidth="2"
          x1={xScale(value)}
          y1={y}
          x2={xScale(value)}
          y2={y + tickSize}
        />
      ))}
      {tickValues.map(value => (
        <text
          key={value}
          fontSize="12"
          x={xScale(value)}
          y={y + 3.2 * tickSize}
        >
          {value}
        </text>
      ))}
    </g>
  );
};

Axis.propTypes = {
  x: PropTypes.number.isRequired,
  endX: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  startVal: PropTypes.number.isRequired,
  endVal: PropTypes.number.isRequired,
  ticks: PropTypes.number.isRequired
};

const Marker = ({ color, id, nodeRadius }) => (
  <marker
    id={id}
    viewBox="0 -5 10 10"
    refX={0}
    refY={0}
    markerWidth={10}
    markerHeight={6}
    fill={color}
    markerUnits="userSpaceOnUse"
    orient="auto"
  >
    <path d="M0,-5L10,0L0,5" />
  </marker>
);

Marker.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  nodeRadius: PropTypes.number.isRequired
};

const Node = ({
  nodeRadius,
  mouseEntersNodeHandler,
  mouseLeavesNodeHandler,
  name
}) => (
    <rect
      width={nodeRadius}
      height={nodeRadius}
      x={-nodeRadius / 2}
      y={-nodeRadius / 2}
      rx={nodeRadius / 5}
      ry={nodeRadius / 5}
      stroke="black"
      strokeWidth="1px"
      fill="white"
      name={name}
      onMouseEnter={mouseEntersNodeHandler}
      onMouseLeave={mouseLeavesNodeHandler}
    ></rect>
  );

Node.propTypes = {
  nodeRadius: PropTypes.number.isRequired,
  mouseEntersNodeHandler: PropTypes.any,
  mouseLeavesNodeHandler: PropTypes.any,
  name: PropTypes.string
};

const generateLinkPath = ({ link, nodeRadius, first = true, node = null }) => {
  const arrowheadSpace = nodeRadius;

  const pathVector = {
    x: link.target.x - link.source.x,
    y: link.target.y - link.source.y
  };
  const radius = Math.sqrt(
    Math.pow(pathVector.x, 2) + Math.pow(pathVector.y, 2)
  );

  const scalingFactor = (radius - arrowheadSpace) / radius;
  const arrowX = link.source.x + scalingFactor * pathVector.x;
  const arrowY = link.source.y + scalingFactor * pathVector.y;

  if (!first && node != null) {
    return `M ${node.nodes[0].x * 0.8} ${node.nodes[0].y + 400} ` + `L ${node.nodes[5].x - 150} ${node.nodes[5].y + 20}`;
  }

  return first ? (`M ${link.source.x} ${link.source.y} ` + `L ${arrowX} ${arrowY}`) : (`M ${link.source.x * 0.8} ${link.source.y + 400} ` + `L ${arrowX * 0.8} ${arrowY + 400}`);
};

const Tangle = props => (
  <div>
    <svg width={props.width} height={props.height + 400} className="svg-container">
      <defs>
        <Marker color="black" id="arrowhead" nodeRadius={props.nodeRadius} />
        <Marker
          color="red"
          id="arrowhead-approved"
          nodeRadius={props.nodeRadius}
        />
        <Marker
          color="blue"
          id="arrowhead-approving"
          nodeRadius={props.nodeRadius}
        />
      </defs>
      <g>
        {props.links.map(link => (
          <path
            className={`links${props.approvedLinks.has(link)
              ? " approved"
              : props.approvingLinks.has(link)
                ? " approving"
                : ""
              }`}
            key={`${link.source.name}->${link.target.name}`}
            d={generateLinkPath({ link, nodeRadius: props.nodeRadius })}
            markerEnd={
              props.approvedLinks.has(link)
                ? "url(#arrowhead-approved)"
                : props.approvingLinks.has(link)
                  ? "url(#arrowhead-approving)"
                  : "url(#arrowhead)"
            }
          />
        ))}
      </g>
      <g>
        {props.nodes.map(node => (
          <g
            transform={`translate(${node.x},${node.y})`}
            key={node.name}
            className={`${props.approvedNodes.has(node)
              ? "approved"
              : props.approvingNodes.has(node)
                ? "approving"
                : props.tips.has(node)
                  ? "tip"
                  : ""
              }`}
          >
            {props.hoveredNode === node && (
              <g style={{ opacity: 0.4 }}>
                <Node nodeRadius={props.nodeRadius * 1.6} />
                <Node nodeRadius={props.nodeRadius * 1.3} />
              </g>
            )}
            <Node
              nodeRadius={props.nodeRadius}
              name={node.name}
              mouseEntersNodeHandler={props.mouseEntersNodeHandler}
              mouseLeavesNodeHandler={props.mouseLeavesNodeHandler}
            />
            {props.showLabels && (
              <text
                className="unselectable"
                fill="#666"
                fontFamily="Helvetica"
                alignmentBaseline="middle"
                textAnchor="middle"
                pointerEvents="none"
              >
                {node.name}
              </text>
            )}
          </g>
        ))}
      </g>
      <g transform={`translate(${150},${0})`}>
        <g>
          {props.links.map((link, index) => (
            <g>
              {index == 0 &&
                <path
                  className={`links`}
                  key={`${link.source.name}->${link.target.name}-0`}
                  d={generateLinkPath({ link, nodeRadius: props.nodeRadius, first: false, node: { nodes: props.nodes, link: link } })}
                  markerEnd={"url(#arrowhead)"}
                />
              }
              <path
                className={`links`}
                key={`${link.source.name}->${link.target.name}`}
                d={generateLinkPath({ link, nodeRadius: props.nodeRadius, first: false })}
                markerEnd={"url(#arrowhead)"}
              />
            </g>
          )
          )}
        </g>
        <g>
          {props.nodes.map((node) => (
            <g
              transform={`translate(${node.x * 0.8},${node.y + 400})`}
              key={node.name}
            >
              <Node
                nodeRadius={props.nodeRadius}
                name={node.name}
              />
              {props.showLabels && (
                <text
                  className="unselectable"
                  fill="#666"
                  fontFamily="Helvetica"
                  alignmentBaseline="middle"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {node.name}
                </text>
              )}
            </g>

          ))}
        </g>
      </g>
      <g>
        <Axis
          x={props.leftMargin}
          endX={props.width - props.rightMargin}
          y={props.height + 370}
          ticks={8}
          startVal={0}
          endVal={
            props.nodes.length < 2
              ? 1
              : Math.max(...props.nodes.map(n => n.time))
          }
        />
      </g>
    </svg>
  </div>
);

Tangle.propTypes = {
  links: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  leftMargin: PropTypes.number.isRequired,
  rightMargin: PropTypes.number.isRequired,
  nodeRadius: PropTypes.number.isRequired,
  mouseEntersNodeHandler: PropTypes.func,
  mouseLeavesNodeHandler: PropTypes.func,
  approvedNodes: PropTypes.any,
  approvedLinks: PropTypes.any,
  approvingNodes: PropTypes.any,
  approvingLinks: PropTypes.any,
  hoveredNode: PropTypes.any
};

export default Tangle;
