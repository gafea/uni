/**
 * chartjs-chart-graph
 * https://github.com/sgratzl/chartjs-chart-graph
 *
 * Copyright (c) 2019-2022 Samuel Gratzl <sam@sgratzl.com>
 */

import { LineElement, registry, ScatterController, defaults, Chart, LinearScale, PointElement } from 'chart.js';
import { merge, unlistenArrayEvents, listenArrayEvents, clipArea, unclipArea } from 'chart.js/helpers';
import { forceSimulation, forceCenter, forceCollide, forceLink, forceManyBody, forceX, forceY, forceRadial } from 'd3-force';
import { hierarchy, tree, cluster } from 'd3-hierarchy';

function horizontal(from, to, options) {
    return {
        fx: (to.x - from.x) * options.tension,
        fy: 0,
        tx: (from.x - to.x) * options.tension,
        ty: 0,
    };
}
function vertical(from, to, options) {
    return {
        fx: 0,
        fy: (to.y - from.y) * options.tension,
        tx: 0,
        ty: (from.y - to.y) * options.tension,
    };
}
function radial(from, to, options) {
    const angleHelper = Math.hypot(to.x - from.x, to.y - from.y) * options.tension;
    return {
        fx: Number.isNaN(from.angle) ? 0 : Math.cos(from.angle || 0) * angleHelper,
        fy: Number.isNaN(from.angle) ? 0 : Math.sin(from.angle || 0) * -angleHelper,
        tx: Number.isNaN(to.angle) ? 0 : Math.cos(to.angle || 0) * -angleHelper,
        ty: Number.isNaN(to.angle) ? 0 : Math.sin(to.angle || 0) * angleHelper,
    };
}
class EdgeLine extends LineElement {
    draw(ctx) {
        const { options } = this;
        ctx.save();
        ctx.lineCap = options.borderCapStyle;
        ctx.setLineDash(options.borderDash || []);
        ctx.lineDashOffset = options.borderDashOffset;
        ctx.lineJoin = options.borderJoinStyle;
        ctx.lineWidth = options.borderWidth;
        ctx.strokeStyle = options.borderColor;
        const orientations = {
            horizontal,
            vertical,
            radial,
        };
        const layout = orientations[this._orientation] || orientations.horizontal;
        const renderLine = (from, to) => {
            const shift = layout(from, to, options);
            const fromX = {
                cpx: from.x + shift.fx,
                cpy: from.y + shift.fy,
            };
            const toX = {
                cpx: to.x + shift.tx,
                cpy: to.y + shift.ty,
            };
            if (options.stepped === 'middle') {
                const midpoint = (from.x + to.x) / 2.0;
                ctx.lineTo(midpoint, from.y);
                ctx.lineTo(midpoint, to.y);
                ctx.lineTo(to.x, to.y);
            }
            else if (options.stepped === 'after') {
                ctx.lineTo(from.x, to.y);
                ctx.lineTo(to.x, to.y);
            }
            else if (options.stepped) {
                ctx.lineTo(to.x, from.y);
                ctx.lineTo(to.x, to.y);
            }
            else if (options.tension) {
                ctx.bezierCurveTo(fromX.cpx, fromX.cpy, toX.cpx, toX.cpy, to.x, to.y);
            }
            else {
                ctx.lineTo(to.x, to.y);
            }
            return to;
        };
        const source = this.source.getProps(['x', 'y', 'angle']);
        const target = this.target.getProps(['x', 'y', 'angle']);
        const points = this.getProps(['points']).points;
        ctx.beginPath();
        let from = source;
        ctx.moveTo(from.x, from.y);
        if (points && points.length > 0) {
            from = points.reduce(renderLine, from);
        }
        renderLine(from, target);
        ctx.stroke();
        if (options.directed) {
            const to = target;
            const shift = layout(from, to, options);
            const s = options.arrowHeadSize;
            const offset = options.arrowHeadOffset;
            ctx.save();
            ctx.translate(to.x, target.y);
            if (options.stepped === 'middle') {
                const midpoint = (from.x + to.x) / 2.0;
                ctx.rotate(Math.atan2(to.y - to.y, to.x - midpoint));
            }
            else if (options.stepped === 'after') {
                ctx.rotate(Math.atan2(to.y - to.y, to.x - from.x));
            }
            else if (options.stepped) {
                ctx.rotate(Math.atan2(to.y - from.y, to.x - to.x));
            }
            else if (options.tension) {
                const toX = {
                    x: to.x + shift.tx,
                    y: to.y + shift.ty,
                };
                const f = 0.1;
                ctx.rotate(Math.atan2(to.y - toX.y * (1 - f) - from.y * f, to.x - toX.x * (1 - f) - from.x * f));
            }
            else {
                ctx.rotate(Math.atan2(to.y - from.y, to.x - from.x));
            }
            ctx.translate(-offset, 0);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-s, -s / 2);
            ctx.lineTo(-s * 0.9, 0);
            ctx.lineTo(-s, s / 2);
            ctx.closePath();
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
}
EdgeLine.id = 'edgeLine';
EdgeLine.defaults = {
    ...LineElement.defaults,
    tension: 0,
    directed: false,
    arrowHeadSize: 15,
    arrowHeadOffset: 5,
};
EdgeLine.defaultRoutes = LineElement.defaultRoutes;
EdgeLine.descriptors = {
    _scriptable: true,
    _indexable: (name) => name !== 'borderDash',
};

function interpolateNumber(from, to, factor) {
    if (from === to) {
        return to;
    }
    return from + (to - from) * factor;
}
function interpolatorPoint(fromArray, i, to, factor) {
    const from = fromArray[i] || fromArray[i - 1] || fromArray._source;
    if (!from) {
        return to;
    }
    const x = interpolateNumber(from.x, to.x, factor);
    const y = interpolateNumber(from.y, to.y, factor);
    const angle = Number.isNaN(from.angle) ? interpolateNumber(from.angle, to.angle, factor) : undefined;
    return { x, y, angle };
}
function interpolatePoints(from, to, factor) {
    if (Array.isArray(from) && Array.isArray(to) && to.length > 0) {
        return to.map((t, i) => interpolatorPoint(from, i, t, factor));
    }
    return to;
}

function patchController(type, config, controller, elements = [], scales = []) {
    registry.addControllers(controller);
    if (Array.isArray(elements)) {
        registry.addElements(...elements);
    }
    else {
        registry.addElements(elements);
    }
    if (Array.isArray(scales)) {
        registry.addScales(...scales);
    }
    else {
        registry.addScales(scales);
    }
    const c = config;
    c.type = type;
    return c;
}

class GraphController extends ScatterController {
    constructor() {
        super(...arguments);
        this._scheduleResyncLayoutId = -1;
        this._edgeListener = {
            _onDataPush: (...args) => {
                const count = args.length;
                const start = this.getDataset().edges.length - count;
                const parsed = this._cachedMeta._parsedEdges;
                args.forEach((edge) => {
                    parsed.push(this._parseDefinedEdge(edge));
                });
                this._insertEdgeElements(start, count);
            },
            _onDataPop: () => {
                this._cachedMeta.edges.pop();
                this._cachedMeta._parsedEdges.pop();
                this._scheduleResyncLayout();
            },
            _onDataShift: () => {
                this._cachedMeta.edges.shift();
                this._cachedMeta._parsedEdges.shift();
                this._scheduleResyncLayout();
            },
            _onDataSplice: (start, count, ...args) => {
                this._cachedMeta.edges.splice(start, count);
                this._cachedMeta._parsedEdges.splice(start, count);
                if (args.length > 0) {
                    const parsed = this._cachedMeta._parsedEdges;
                    parsed.splice(start, 0, ...args.map((edge) => this._parseDefinedEdge(edge)));
                    this._insertEdgeElements(start, args.length);
                }
                else {
                    this._scheduleResyncLayout();
                }
            },
            _onDataUnshift: (...args) => {
                const parsed = this._cachedMeta._parsedEdges;
                parsed.unshift(...args.map((edge) => this._parseDefinedEdge(edge)));
                this._insertEdgeElements(0, args.length);
            },
        };
    }
    initialize() {
        const type = this._type;
        const defaultConfig = defaults.datasets[type];
        this.edgeElementType = registry.getElement(defaultConfig.edgeElementType);
        super.initialize();
        this.enableOptionSharing = true;
        this._scheduleResyncLayout();
    }
    parse(start, count) {
        const meta = this._cachedMeta;
        const data = this._data;
        const { iScale, vScale } = meta;
        for (let i = 0; i < count; i += 1) {
            const index = i + start;
            const d = data[index];
            const v = (meta._parsed[index] || {});
            if (d && typeof d.x === 'number') {
                v.x = d.x;
            }
            if (d && typeof d.y === 'number') {
                v.y = d.y;
            }
            meta._parsed[index] = v;
        }
        if (meta._parsed.length > data.length) {
            meta._parsed.splice(data.length, meta._parsed.length - data.length);
        }
        this._cachedMeta._sorted = false;
        iScale._dataLimitsCached = false;
        vScale._dataLimitsCached = false;
        this._parseEdges();
    }
    reset() {
        this.resetLayout();
        super.reset();
    }
    update(mode) {
        super.update(mode);
        const meta = this._cachedMeta;
        const edges = meta.edges || [];
        this.updateEdgeElements(edges, 0, mode);
    }
    destroy() {
        ScatterController.prototype.destroy.call(this);
        if (this._edges) {
            unlistenArrayEvents(this._edges, this._edgeListener);
        }
        this.stopLayout();
    }
    updateEdgeElements(edges, start, mode) {
        var _a, _b, _c;
        const bak = {
            _cachedDataOpts: this._cachedDataOpts,
            dataElementType: this.dataElementType,
            _sharedOptions: this._sharedOptions,
        };
        this._cachedDataOpts = {};
        this.dataElementType = this.edgeElementType;
        this._sharedOptions = this._edgeSharedOptions;
        const meta = this._cachedMeta;
        const nodes = meta.data;
        const data = this._cachedMeta._parsedEdges;
        const reset = mode === 'reset';
        const firstOpts = this.resolveDataElementOptions(start, mode);
        const dummyShared = {};
        const sharedOptions = (_a = this.getSharedOptions(firstOpts)) !== null && _a !== void 0 ? _a : dummyShared;
        const includeOptions = this.includeOptions(mode, sharedOptions);
        const { xScale, yScale } = meta;
        const base = {
            x: (_b = xScale === null || xScale === void 0 ? void 0 : xScale.getBasePixel()) !== null && _b !== void 0 ? _b : 0,
            y: (_c = yScale === null || yScale === void 0 ? void 0 : yScale.getBasePixel()) !== null && _c !== void 0 ? _c : 0,
        };
        function copyPoint(point) {
            var _a, _b;
            const x = reset ? base.x : (_a = xScale === null || xScale === void 0 ? void 0 : xScale.getPixelForValue(point.x, 0)) !== null && _a !== void 0 ? _a : 0;
            const y = reset ? base.y : (_b = yScale === null || yScale === void 0 ? void 0 : yScale.getPixelForValue(point.y, 0)) !== null && _b !== void 0 ? _b : 0;
            return {
                x,
                y,
                angle: point.angle,
            };
        }
        for (let i = 0; i < edges.length; i += 1) {
            const edge = edges[i];
            const index = start + i;
            const parsed = data[index];
            const properties = {
                source: nodes[parsed.source],
                target: nodes[parsed.target],
                points: Array.isArray(parsed.points) ? parsed.points.map((p) => copyPoint(p)) : [],
            };
            properties.points._source = nodes[parsed.source];
            if (includeOptions) {
                if (sharedOptions !== dummyShared) {
                    properties.options = sharedOptions;
                }
                else {
                    properties.options = this.resolveDataElementOptions(index, mode);
                }
            }
            this.updateEdgeElement(edge, index, properties, mode);
        }
        this.updateSharedOptions(sharedOptions, mode, firstOpts);
        this._edgeSharedOptions = this._sharedOptions;
        Object.assign(this, bak);
    }
    updateEdgeElement(edge, index, properties, mode) {
        super.updateElement(edge, index, properties, mode);
    }
    updateElement(point, index, properties, mode) {
        var _a;
        if (mode === 'reset') {
            const { xScale } = this._cachedMeta;
            properties.x = (_a = xScale === null || xScale === void 0 ? void 0 : xScale.getBasePixel()) !== null && _a !== void 0 ? _a : 0;
        }
        super.updateElement(point, index, properties, mode);
    }
    resolveNodeIndex(nodes, ref) {
        if (typeof ref === 'number') {
            return ref;
        }
        if (typeof ref === 'string') {
            const labels = this.chart.data.labels;
            return labels.indexOf(ref);
        }
        const nIndex = nodes.indexOf(ref);
        if (nIndex >= 0) {
            return nIndex;
        }
        const data = this.getDataset().data;
        const index = data.indexOf(ref);
        if (index >= 0) {
            return index;
        }
        console.warn('cannot resolve edge ref', ref);
        return -1;
    }
    buildOrUpdateElements() {
        const dataset = this.getDataset();
        const edges = dataset.edges || [];
        if (this._edges !== edges) {
            if (this._edges) {
                unlistenArrayEvents(this._edges, this._edgeListener);
            }
            if (edges && Object.isExtensible(edges)) {
                listenArrayEvents(edges, this._edgeListener);
            }
            this._edges = edges;
        }
        super.buildOrUpdateElements();
    }
    draw() {
        const meta = this._cachedMeta;
        const edges = this._cachedMeta.edges || [];
        const elements = (meta.data || []);
        const area = this.chart.chartArea;
        const ctx = this._ctx;
        if (edges.length > 0) {
            clipArea(ctx, area);
            edges.forEach((edge) => edge.draw.call(edge, ctx, area));
            unclipArea(ctx);
        }
        elements.forEach((elem) => elem.draw.call(elem, ctx, area));
    }
    _resyncElements() {
        ScatterController.prototype._resyncElements.call(this);
        const meta = this._cachedMeta;
        const edges = meta._parsedEdges;
        const metaEdges = meta.edges || (meta.edges = []);
        const numMeta = metaEdges.length;
        const numData = edges.length;
        if (numData < numMeta) {
            metaEdges.splice(numData, numMeta - numData);
            this._scheduleResyncLayout();
        }
        else if (numData > numMeta) {
            this._insertEdgeElements(numMeta, numData - numMeta);
        }
    }
    getTreeRootIndex() {
        const ds = this.getDataset();
        const nodes = ds.data;
        if (ds.derivedEdges) {
            return nodes.findIndex((d) => d.parent == null);
        }
        const edges = this._cachedMeta._parsedEdges || [];
        const nodeIndices = new Set(nodes.map((_, i) => i));
        edges.forEach((edge) => {
            nodeIndices.delete(edge.target);
        });
        return Array.from(nodeIndices)[0];
    }
    getTreeRoot() {
        const index = this.getTreeRootIndex();
        const p = this.getParsed(index);
        p.index = index;
        return p;
    }
    getTreeChildren(node) {
        var _a;
        const edges = this._cachedMeta._parsedEdges;
        const index = (_a = node.index) !== null && _a !== void 0 ? _a : 0;
        return edges
            .filter((d) => d.source === index)
            .map((d) => {
            const p = this.getParsed(d.target);
            p.index = d.target;
            return p;
        });
    }
    _parseDefinedEdge(edge) {
        const ds = this.getDataset();
        const { data } = ds;
        return {
            source: this.resolveNodeIndex(data, edge.source),
            target: this.resolveNodeIndex(data, edge.target),
            points: [],
        };
    }
    _parseEdges() {
        const ds = this.getDataset();
        const data = ds.data;
        const meta = this._cachedMeta;
        if (ds.edges) {
            const edges = ds.edges.map((edge) => this._parseDefinedEdge(edge));
            meta._parsedEdges = edges;
            return edges;
        }
        const edges = [];
        meta._parsedEdges = edges;
        data.forEach((node, i) => {
            if (node.parent != null) {
                const parent = this.resolveNodeIndex(data, node.parent);
                edges.push({
                    source: parent,
                    target: i,
                    points: [],
                });
            }
        });
        return edges;
    }
    addElements() {
        super.addElements();
        const meta = this._cachedMeta;
        const edges = this._parseEdges();
        const metaData = new Array(edges.length);
        meta.edges = metaData;
        for (let i = 0; i < edges.length; i += 1) {
            metaData[i] = new this.edgeElementType();
        }
    }
    _resyncEdgeElements() {
        const meta = this._cachedMeta;
        const edges = this._parseEdges();
        const metaData = meta.edges || (meta.edges = []);
        for (let i = 0; i < edges.length; i += 1) {
            metaData[i] = metaData[i] || new this.edgeElementType();
        }
        if (edges.length < metaData.length) {
            metaData.splice(edges.length, metaData.length);
        }
    }
    _insertElements(start, count) {
        ScatterController.prototype._insertElements.call(this, start, count);
        if (count > 0) {
            this._resyncEdgeElements();
        }
    }
    _removeElements(start, count) {
        ScatterController.prototype._removeElements.call(this, start, count);
        if (count > 0) {
            this._resyncEdgeElements();
        }
    }
    _insertEdgeElements(start, count) {
        const elements = [];
        for (let i = 0; i < count; i += 1) {
            elements.push(new this.edgeElementType());
        }
        this._cachedMeta.edges.splice(start, 0, ...elements);
        this.updateEdgeElements(elements, start, 'reset');
        this._scheduleResyncLayout();
    }
    reLayout() {
    }
    resetLayout() {
    }
    stopLayout() {
    }
    _scheduleResyncLayout() {
        if (this._scheduleResyncLayoutId != null && this._scheduleResyncLayoutId >= 0) {
            return;
        }
        this._scheduleResyncLayoutId = requestAnimationFrame(() => {
            this._scheduleResyncLayoutId = -1;
            this.resyncLayout();
        });
    }
    resyncLayout() {
    }
}
GraphController.id = 'graph';
GraphController.defaults = merge({}, [
    ScatterController.defaults,
    {
        clip: 10,
        animations: {
            points: {
                fn: interpolatePoints,
                properties: ['points'],
            },
        },
        edgeElementType: EdgeLine.id,
    },
]);
GraphController.overrides = merge({}, [
    ScatterController.overrides,
    {
        layout: {
            padding: 10,
        },
        scales: {
            x: {
                display: false,
                ticks: {
                    maxTicksLimit: 2,
                    precision: 100,
                    minRotation: 0,
                    maxRotation: 0,
                },
            },
            y: {
                display: false,
                ticks: {
                    maxTicksLimit: 2,
                    precision: 100,
                    minRotation: 0,
                    maxRotation: 0,
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label(item) {
                        var _a, _b;
                        return (_b = (_a = item.chart.data) === null || _a === void 0 ? void 0 : _a.labels) === null || _b === void 0 ? void 0 : _b[item.dataIndex];
                    },
                },
            },
        },
    },
]);
class GraphChart extends Chart {
    constructor(item, config) {
        super(item, patchController('graph', config, GraphController, [EdgeLine, PointElement], LinearScale));
    }
}
GraphChart.id = GraphController.id;

class ForceDirectedGraphController extends GraphController {
    constructor(chart, datasetIndex) {
        super(chart, datasetIndex);
        this._simulation = forceSimulation()
            .on('tick', () => {
            this._copyPosition();
            this.chart.render();
        })
            .on('end', () => {
            this._copyPosition();
            this.chart.render();
            this.chart.update('default');
        });
        const sim = this.options.simulation;
        const fs = {
            center: forceCenter,
            collide: forceCollide,
            link: forceLink,
            manyBody: forceManyBody,
            x: forceX,
            y: forceY,
            radial: forceRadial,
        };
        Object.keys(fs).forEach((key) => {
            const options = sim.forces[key];
            if (!options) {
                return;
            }
            const f = fs[key]();
            if (typeof options !== 'boolean') {
                Object.keys(options).forEach((attr) => {
                    f[attr](options[attr]);
                });
            }
            this._simulation.force(key, f);
        });
        this._simulation.stop();
    }
    _copyPosition() {
        const nodes = this._cachedMeta._parsed;
        const minmax = nodes.reduce((acc, v) => {
            const s = v._sim;
            if (!s || s.x == null || s.y == null) {
                return acc;
            }
            if (s.x < acc.minX) {
                acc.minX = s.x;
            }
            if (s.x > acc.maxX) {
                acc.maxX = s.x;
            }
            if (s.y < acc.minY) {
                acc.minY = s.y;
            }
            if (s.y > acc.maxY) {
                acc.maxY = s.y;
            }
            return acc;
        }, {
            minX: Number.POSITIVE_INFINITY,
            maxX: Number.NEGATIVE_INFINITY,
            minY: Number.POSITIVE_INFINITY,
            maxY: Number.NEGATIVE_INFINITY,
        });
        const rescaleX = (v) => ((v - minmax.minX) / (minmax.maxX - minmax.minX)) * 2 - 1;
        const rescaleY = (v) => ((v - minmax.minY) / (minmax.maxY - minmax.minY)) * 2 - 1;
        nodes.forEach((node) => {
            var _a, _b;
            if (node._sim) {
                node.x = rescaleX((_a = node._sim.x) !== null && _a !== void 0 ? _a : 0);
                node.y = rescaleY((_b = node._sim.y) !== null && _b !== void 0 ? _b : 0);
            }
        });
        const { xScale, yScale } = this._cachedMeta;
        const elems = this._cachedMeta.data;
        elems.forEach((elem, i) => {
            var _a, _b;
            const parsed = nodes[i];
            Object.assign(elem, {
                x: (_a = xScale === null || xScale === void 0 ? void 0 : xScale.getPixelForValue(parsed.x, i)) !== null && _a !== void 0 ? _a : 0,
                y: (_b = yScale === null || yScale === void 0 ? void 0 : yScale.getPixelForValue(parsed.y, i)) !== null && _b !== void 0 ? _b : 0,
                skip: false,
            });
        });
    }
    resetLayout() {
        super.resetLayout();
        this._simulation.stop();
        const nodes = this._cachedMeta._parsed.map((node, i) => {
            const simNode = { ...node };
            simNode.index = i;
            node._sim = simNode;
            if (!node.reset) {
                return simNode;
            }
            delete simNode.x;
            delete simNode.y;
            delete simNode.vx;
            delete simNode.vy;
            return simNode;
        });
        this._simulation.nodes(nodes);
        this._simulation.alpha(1).restart();
    }
    resyncLayout() {
        super.resyncLayout();
        this._simulation.stop();
        const meta = this._cachedMeta;
        const nodes = meta._parsed.map((node, i) => {
            const simNode = { ...node };
            simNode.index = i;
            node._sim = simNode;
            if (simNode.x === null) {
                delete simNode.x;
            }
            if (simNode.y === null) {
                delete simNode.y;
            }
            if (simNode.x == null && simNode.y == null) {
                node.reset = true;
            }
            return simNode;
        });
        const link = this._simulation.force('link');
        if (link) {
            link.links([]);
        }
        this._simulation.nodes(nodes);
        if (link) {
            link.links((meta._parsedEdges || []).map((l) => ({ ...l })));
        }
        if (this.options.simulation.initialIterations > 0) {
            this._simulation.alpha(1);
            this._simulation.tick(this.options.simulation.initialIterations);
            this._copyPosition();
            if (this.options.simulation.autoRestart) {
                this._simulation.restart();
            }
            else {
                requestAnimationFrame(() => this.chart.update());
            }
        }
        else if (this.options.simulation.autoRestart) {
            this._simulation.alpha(1).restart();
        }
    }
    reLayout() {
        this._simulation.alpha(1).restart();
    }
    stopLayout() {
        super.stopLayout();
        this._simulation.stop();
    }
}
ForceDirectedGraphController.id = 'forceDirectedGraph';
ForceDirectedGraphController.defaults = merge({}, [
    GraphController.defaults,
    {
        animation: false,
        simulation: {
            initialIterations: 0,
            autoRestart: true,
            forces: {
                center: true,
                collide: false,
                link: true,
                manyBody: true,
                x: false,
                y: false,
                radial: false,
            },
        },
    },
]);
ForceDirectedGraphController.overrides = merge({}, [
    GraphController.overrides,
    {
        scales: {
            x: {
                min: -1,
                max: 1,
            },
            y: {
                min: -1,
                max: 1,
            },
        },
    },
]);
class ForceDirectedGraphChart extends Chart {
    constructor(item, config) {
        super(item, patchController('forceDirectedGraph', config, ForceDirectedGraphController, [EdgeLine, PointElement], LinearScale));
    }
}
ForceDirectedGraphChart.id = ForceDirectedGraphController.id;

class DendrogramController extends GraphController {
    updateEdgeElement(line, index, properties, mode) {
        properties._orientation = this.options.tree.orientation;
        super.updateEdgeElement(line, index, properties, mode);
    }
    updateElement(point, index, properties, mode) {
        if (index != null) {
            properties.angle = this.getParsed(index).angle;
        }
        super.updateElement(point, index, properties, mode);
    }
    resyncLayout() {
        const meta = this._cachedMeta;
        meta.root = hierarchy(this.getTreeRoot(), (d) => this.getTreeChildren(d))
            .count()
            .sort((a, b) => { var _a, _b; return b.height - a.height || ((_a = b.data.index) !== null && _a !== void 0 ? _a : 0) - ((_b = a.data.index) !== null && _b !== void 0 ? _b : 0); });
        this.doLayout(meta.root);
        super.resyncLayout();
    }
    reLayout(newOptions = {}) {
        if (newOptions) {
            Object.assign(this.options.tree, newOptions);
            const ds = this.getDataset();
            if (ds.tree) {
                Object.assign(ds.tree, newOptions);
            }
            else {
                ds.tree = newOptions;
            }
        }
        this.doLayout(this._cachedMeta.root);
    }
    doLayout(root) {
        const options = this.options.tree;
        const layout = options.mode === 'tree'
            ? tree()
            : cluster();
        if (options.orientation === 'radial') {
            layout.size([Math.PI * 2, 1]);
        }
        else {
            layout.size([2, 2]);
        }
        const orientation = {
            horizontal: (d) => {
                d.data.x = d.y - 1;
                d.data.y = -d.x + 1;
            },
            vertical: (d) => {
                d.data.x = d.x - 1;
                d.data.y = -d.y + 1;
            },
            radial: (d) => {
                d.data.x = Math.cos(d.x) * d.y;
                d.data.y = Math.sin(d.x) * d.y;
                d.data.angle = d.y === 0 ? Number.NaN : d.x;
            },
        };
        layout(root).each((orientation[options.orientation] || orientation.horizontal));
        requestAnimationFrame(() => this.chart.update());
    }
}
DendrogramController.id = 'dendrogram';
DendrogramController.defaults = merge({}, [
    GraphController.defaults,
    {
        tree: {
            mode: 'dendrogram',
            orientation: 'horizontal',
        },
        animations: {
            numbers: {
                type: 'number',
                properties: ['x', 'y', 'angle', 'radius', 'rotation', 'borderWidth'],
            },
        },
        tension: 0.4,
    },
]);
DendrogramController.overrides = merge({}, [
    GraphController.overrides,
    {
        scales: {
            x: {
                min: -1,
                max: 1,
            },
            y: {
                min: -1,
                max: 1,
            },
        },
    },
]);
class DendrogramChart extends Chart {
    constructor(item, config) {
        super(item, patchController('dendrogram', config, DendrogramController, [EdgeLine, PointElement], LinearScale));
    }
}
DendrogramChart.id = DendrogramController.id;
class DendogramController extends DendrogramController {
}
DendogramController.id = 'dendogram';
DendogramController.defaults = merge({}, [
    DendrogramController.defaults,
    {
        tree: {
            mode: 'dendrogram',
        },
    },
]);
const DendogramChart = DendrogramChart;

class TreeController extends DendrogramController {
}
TreeController.id = 'tree';
TreeController.defaults = merge({}, [
    DendrogramController.defaults,
    {
        tree: {
            mode: 'tree',
        },
    },
]);
TreeController.overrides = DendrogramController.overrides;
class TreeChart extends Chart {
    constructor(item, config) {
        super(item, patchController('tree', config, TreeController, [EdgeLine, PointElement], LinearScale));
    }
}
TreeChart.id = TreeController.id;

export { DendogramChart, DendogramController, DendrogramChart, DendrogramController, EdgeLine, ForceDirectedGraphChart, ForceDirectedGraphController, GraphChart, GraphController, TreeChart, TreeController };
//# sourceMappingURL=index.js.map
