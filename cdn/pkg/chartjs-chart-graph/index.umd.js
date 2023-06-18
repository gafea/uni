/**
 * chartjs-chart-graph
 * https://github.com/sgratzl/chartjs-chart-graph
 *
 * Copyright (c) 2019-2022 Samuel Gratzl <sam@sgratzl.com>
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('chart.js'), require('chart.js/helpers')) :
    typeof define === 'function' && define.amd ? define(['exports', 'chart.js', 'chart.js/helpers'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ChartGraphs = {}, global.Chart, global.Chart.helpers));
})(this, (function (exports, chart_js, helpers) { 'use strict';

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
    class EdgeLine extends chart_js.LineElement {
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
        ...chart_js.LineElement.defaults,
        tension: 0,
        directed: false,
        arrowHeadSize: 15,
        arrowHeadOffset: 5,
    };
    EdgeLine.defaultRoutes = chart_js.LineElement.defaultRoutes;
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
        chart_js.registry.addControllers(controller);
        if (Array.isArray(elements)) {
            chart_js.registry.addElements(...elements);
        }
        else {
            chart_js.registry.addElements(elements);
        }
        if (Array.isArray(scales)) {
            chart_js.registry.addScales(...scales);
        }
        else {
            chart_js.registry.addScales(scales);
        }
        const c = config;
        c.type = type;
        return c;
    }

    class GraphController extends chart_js.ScatterController {
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
            const defaultConfig = chart_js.defaults.datasets[type];
            this.edgeElementType = chart_js.registry.getElement(defaultConfig.edgeElementType);
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
            chart_js.ScatterController.prototype.destroy.call(this);
            if (this._edges) {
                helpers.unlistenArrayEvents(this._edges, this._edgeListener);
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
                    helpers.unlistenArrayEvents(this._edges, this._edgeListener);
                }
                if (edges && Object.isExtensible(edges)) {
                    helpers.listenArrayEvents(edges, this._edgeListener);
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
                helpers.clipArea(ctx, area);
                edges.forEach((edge) => edge.draw.call(edge, ctx, area));
                helpers.unclipArea(ctx);
            }
            elements.forEach((elem) => elem.draw.call(elem, ctx, area));
        }
        _resyncElements() {
            chart_js.ScatterController.prototype._resyncElements.call(this);
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
            chart_js.ScatterController.prototype._insertElements.call(this, start, count);
            if (count > 0) {
                this._resyncEdgeElements();
            }
        }
        _removeElements(start, count) {
            chart_js.ScatterController.prototype._removeElements.call(this, start, count);
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
    GraphController.defaults = helpers.merge({}, [
        chart_js.ScatterController.defaults,
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
    GraphController.overrides = helpers.merge({}, [
        chart_js.ScatterController.overrides,
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
    class GraphChart extends chart_js.Chart {
        constructor(item, config) {
            super(item, patchController('graph', config, GraphController, [EdgeLine, chart_js.PointElement], chart_js.LinearScale));
        }
    }
    GraphChart.id = GraphController.id;

    function forceCenter(x, y) {
      var nodes, strength = 1;

      if (x == null) x = 0;
      if (y == null) y = 0;

      function force() {
        var i,
            n = nodes.length,
            node,
            sx = 0,
            sy = 0;

        for (i = 0; i < n; ++i) {
          node = nodes[i], sx += node.x, sy += node.y;
        }

        for (sx = (sx / n - x) * strength, sy = (sy / n - y) * strength, i = 0; i < n; ++i) {
          node = nodes[i], node.x -= sx, node.y -= sy;
        }
      }

      force.initialize = function(_) {
        nodes = _;
      };

      force.x = function(_) {
        return arguments.length ? (x = +_, force) : x;
      };

      force.y = function(_) {
        return arguments.length ? (y = +_, force) : y;
      };

      force.strength = function(_) {
        return arguments.length ? (strength = +_, force) : strength;
      };

      return force;
    }

    function tree_add(d) {
      const x = +this._x.call(null, d),
          y = +this._y.call(null, d);
      return add(this.cover(x, y), x, y, d);
    }

    function add(tree, x, y, d) {
      if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

      var parent,
          node = tree._root,
          leaf = {data: d},
          x0 = tree._x0,
          y0 = tree._y0,
          x1 = tree._x1,
          y1 = tree._y1,
          xm,
          ym,
          xp,
          yp,
          right,
          bottom,
          i,
          j;

      // If the tree is empty, initialize the root as a leaf.
      if (!node) return tree._root = leaf, tree;

      // Find the existing leaf for the new point, or add it.
      while (node.length) {
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
        if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
      }

      // Is the new point is exactly coincident with the existing point?
      xp = +tree._x.call(null, node.data);
      yp = +tree._y.call(null, node.data);
      if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

      // Otherwise, split the leaf node until the old and new point are separated.
      do {
        parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | (xp >= xm)));
      return parent[j] = node, parent[i] = leaf, tree;
    }

    function addAll(data) {
      var d, i, n = data.length,
          x,
          y,
          xz = new Array(n),
          yz = new Array(n),
          x0 = Infinity,
          y0 = Infinity,
          x1 = -Infinity,
          y1 = -Infinity;

      // Compute the points and their extent.
      for (i = 0; i < n; ++i) {
        if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
        xz[i] = x;
        yz[i] = y;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }

      // If there were no (valid) points, abort.
      if (x0 > x1 || y0 > y1) return this;

      // Expand the tree to cover the new points.
      this.cover(x0, y0).cover(x1, y1);

      // Add the new points.
      for (i = 0; i < n; ++i) {
        add(this, xz[i], yz[i], data[i]);
      }

      return this;
    }

    function tree_cover(x, y) {
      if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

      var x0 = this._x0,
          y0 = this._y0,
          x1 = this._x1,
          y1 = this._y1;

      // If the quadtree has no extent, initialize them.
      // Integer extent are necessary so that if we later double the extent,
      // the existing quadrant boundaries don’t change due to floating point error!
      if (isNaN(x0)) {
        x1 = (x0 = Math.floor(x)) + 1;
        y1 = (y0 = Math.floor(y)) + 1;
      }

      // Otherwise, double repeatedly to cover.
      else {
        var z = x1 - x0 || 1,
            node = this._root,
            parent,
            i;

        while (x0 > x || x >= x1 || y0 > y || y >= y1) {
          i = (y < y0) << 1 | (x < x0);
          parent = new Array(4), parent[i] = node, node = parent, z *= 2;
          switch (i) {
            case 0: x1 = x0 + z, y1 = y0 + z; break;
            case 1: x0 = x1 - z, y1 = y0 + z; break;
            case 2: x1 = x0 + z, y0 = y1 - z; break;
            case 3: x0 = x1 - z, y0 = y1 - z; break;
          }
        }

        if (this._root && this._root.length) this._root = node;
      }

      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
      return this;
    }

    function tree_data() {
      var data = [];
      this.visit(function(node) {
        if (!node.length) do data.push(node.data); while (node = node.next)
      });
      return data;
    }

    function tree_extent(_) {
      return arguments.length
          ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1])
          : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
    }

    function Quad(node, x0, y0, x1, y1) {
      this.node = node;
      this.x0 = x0;
      this.y0 = y0;
      this.x1 = x1;
      this.y1 = y1;
    }

    function tree_find(x, y, radius) {
      var data,
          x0 = this._x0,
          y0 = this._y0,
          x1,
          y1,
          x2,
          y2,
          x3 = this._x1,
          y3 = this._y1,
          quads = [],
          node = this._root,
          q,
          i;

      if (node) quads.push(new Quad(node, x0, y0, x3, y3));
      if (radius == null) radius = Infinity;
      else {
        x0 = x - radius, y0 = y - radius;
        x3 = x + radius, y3 = y + radius;
        radius *= radius;
      }

      while (q = quads.pop()) {

        // Stop searching if this quadrant can’t contain a closer node.
        if (!(node = q.node)
            || (x1 = q.x0) > x3
            || (y1 = q.y0) > y3
            || (x2 = q.x1) < x0
            || (y2 = q.y1) < y0) continue;

        // Bisect the current quadrant.
        if (node.length) {
          var xm = (x1 + x2) / 2,
              ym = (y1 + y2) / 2;

          quads.push(
            new Quad(node[3], xm, ym, x2, y2),
            new Quad(node[2], x1, ym, xm, y2),
            new Quad(node[1], xm, y1, x2, ym),
            new Quad(node[0], x1, y1, xm, ym)
          );

          // Visit the closest quadrant first.
          if (i = (y >= ym) << 1 | (x >= xm)) {
            q = quads[quads.length - 1];
            quads[quads.length - 1] = quads[quads.length - 1 - i];
            quads[quads.length - 1 - i] = q;
          }
        }

        // Visit this point. (Visiting coincident points isn’t necessary!)
        else {
          var dx = x - +this._x.call(null, node.data),
              dy = y - +this._y.call(null, node.data),
              d2 = dx * dx + dy * dy;
          if (d2 < radius) {
            var d = Math.sqrt(radius = d2);
            x0 = x - d, y0 = y - d;
            x3 = x + d, y3 = y + d;
            data = node.data;
          }
        }
      }

      return data;
    }

    function tree_remove(d) {
      if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

      var parent,
          node = this._root,
          retainer,
          previous,
          next,
          x0 = this._x0,
          y0 = this._y0,
          x1 = this._x1,
          y1 = this._y1,
          x,
          y,
          xm,
          ym,
          right,
          bottom,
          i,
          j;

      // If the tree is empty, initialize the root as a leaf.
      if (!node) return this;

      // Find the leaf node for the point.
      // While descending, also retain the deepest parent with a non-removed sibling.
      if (node.length) while (true) {
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
        if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
        if (!node.length) break;
        if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) retainer = parent, j = i;
      }

      // Find the point to remove.
      while (node.data !== d) if (!(previous = node, node = node.next)) return this;
      if (next = node.next) delete node.next;

      // If there are multiple coincident points, remove just the point.
      if (previous) return (next ? previous.next = next : delete previous.next), this;

      // If this is the root point, remove it.
      if (!parent) return this._root = next, this;

      // Remove this leaf.
      next ? parent[i] = next : delete parent[i];

      // If the parent now contains exactly one leaf, collapse superfluous parents.
      if ((node = parent[0] || parent[1] || parent[2] || parent[3])
          && node === (parent[3] || parent[2] || parent[1] || parent[0])
          && !node.length) {
        if (retainer) retainer[j] = node;
        else this._root = node;
      }

      return this;
    }

    function removeAll(data) {
      for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
      return this;
    }

    function tree_root() {
      return this._root;
    }

    function tree_size() {
      var size = 0;
      this.visit(function(node) {
        if (!node.length) do ++size; while (node = node.next)
      });
      return size;
    }

    function tree_visit(callback) {
      var quads = [], q, node = this._root, child, x0, y0, x1, y1;
      if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
      while (q = quads.pop()) {
        if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
          var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
          if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
          if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
          if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
          if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
        }
      }
      return this;
    }

    function tree_visitAfter(callback) {
      var quads = [], next = [], q;
      if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
      while (q = quads.pop()) {
        var node = q.node;
        if (node.length) {
          var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
          if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
          if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
          if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
          if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
        }
        next.push(q);
      }
      while (q = next.pop()) {
        callback(q.node, q.x0, q.y0, q.x1, q.y1);
      }
      return this;
    }

    function defaultX(d) {
      return d[0];
    }

    function tree_x(_) {
      return arguments.length ? (this._x = _, this) : this._x;
    }

    function defaultY(d) {
      return d[1];
    }

    function tree_y(_) {
      return arguments.length ? (this._y = _, this) : this._y;
    }

    function quadtree(nodes, x, y) {
      var tree = new Quadtree(x == null ? defaultX : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
      return nodes == null ? tree : tree.addAll(nodes);
    }

    function Quadtree(x, y, x0, y0, x1, y1) {
      this._x = x;
      this._y = y;
      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
      this._root = undefined;
    }

    function leaf_copy(leaf) {
      var copy = {data: leaf.data}, next = copy;
      while (leaf = leaf.next) next = next.next = {data: leaf.data};
      return copy;
    }

    var treeProto = quadtree.prototype = Quadtree.prototype;

    treeProto.copy = function() {
      var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
          node = this._root,
          nodes,
          child;

      if (!node) return copy;

      if (!node.length) return copy._root = leaf_copy(node), copy;

      nodes = [{source: node, target: copy._root = new Array(4)}];
      while (node = nodes.pop()) {
        for (var i = 0; i < 4; ++i) {
          if (child = node.source[i]) {
            if (child.length) nodes.push({source: child, target: node.target[i] = new Array(4)});
            else node.target[i] = leaf_copy(child);
          }
        }
      }

      return copy;
    };

    treeProto.add = tree_add;
    treeProto.addAll = addAll;
    treeProto.cover = tree_cover;
    treeProto.data = tree_data;
    treeProto.extent = tree_extent;
    treeProto.find = tree_find;
    treeProto.remove = tree_remove;
    treeProto.removeAll = removeAll;
    treeProto.root = tree_root;
    treeProto.size = tree_size;
    treeProto.visit = tree_visit;
    treeProto.visitAfter = tree_visitAfter;
    treeProto.x = tree_x;
    treeProto.y = tree_y;

    function constant(x) {
      return function() {
        return x;
      };
    }

    function jiggle(random) {
      return (random() - 0.5) * 1e-6;
    }

    function x$1(d) {
      return d.x + d.vx;
    }

    function y$1(d) {
      return d.y + d.vy;
    }

    function forceCollide(radius) {
      var nodes,
          radii,
          random,
          strength = 1,
          iterations = 1;

      if (typeof radius !== "function") radius = constant(radius == null ? 1 : +radius);

      function force() {
        var i, n = nodes.length,
            tree,
            node,
            xi,
            yi,
            ri,
            ri2;

        for (var k = 0; k < iterations; ++k) {
          tree = quadtree(nodes, x$1, y$1).visitAfter(prepare);
          for (i = 0; i < n; ++i) {
            node = nodes[i];
            ri = radii[node.index], ri2 = ri * ri;
            xi = node.x + node.vx;
            yi = node.y + node.vy;
            tree.visit(apply);
          }
        }

        function apply(quad, x0, y0, x1, y1) {
          var data = quad.data, rj = quad.r, r = ri + rj;
          if (data) {
            if (data.index > node.index) {
              var x = xi - data.x - data.vx,
                  y = yi - data.y - data.vy,
                  l = x * x + y * y;
              if (l < r * r) {
                if (x === 0) x = jiggle(random), l += x * x;
                if (y === 0) y = jiggle(random), l += y * y;
                l = (r - (l = Math.sqrt(l))) / l * strength;
                node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj));
                node.vy += (y *= l) * r;
                data.vx -= x * (r = 1 - r);
                data.vy -= y * r;
              }
            }
            return;
          }
          return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
        }
      }

      function prepare(quad) {
        if (quad.data) return quad.r = radii[quad.data.index];
        for (var i = quad.r = 0; i < 4; ++i) {
          if (quad[i] && quad[i].r > quad.r) {
            quad.r = quad[i].r;
          }
        }
      }

      function initialize() {
        if (!nodes) return;
        var i, n = nodes.length, node;
        radii = new Array(n);
        for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
      }

      force.initialize = function(_nodes, _random) {
        nodes = _nodes;
        random = _random;
        initialize();
      };

      force.iterations = function(_) {
        return arguments.length ? (iterations = +_, force) : iterations;
      };

      force.strength = function(_) {
        return arguments.length ? (strength = +_, force) : strength;
      };

      force.radius = function(_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), initialize(), force) : radius;
      };

      return force;
    }

    function index(d) {
      return d.index;
    }

    function find(nodeById, nodeId) {
      var node = nodeById.get(nodeId);
      if (!node) throw new Error("node not found: " + nodeId);
      return node;
    }

    function forceLink(links) {
      var id = index,
          strength = defaultStrength,
          strengths,
          distance = constant(30),
          distances,
          nodes,
          count,
          bias,
          random,
          iterations = 1;

      if (links == null) links = [];

      function defaultStrength(link) {
        return 1 / Math.min(count[link.source.index], count[link.target.index]);
      }

      function force(alpha) {
        for (var k = 0, n = links.length; k < iterations; ++k) {
          for (var i = 0, link, source, target, x, y, l, b; i < n; ++i) {
            link = links[i], source = link.source, target = link.target;
            x = target.x + target.vx - source.x - source.vx || jiggle(random);
            y = target.y + target.vy - source.y - source.vy || jiggle(random);
            l = Math.sqrt(x * x + y * y);
            l = (l - distances[i]) / l * alpha * strengths[i];
            x *= l, y *= l;
            target.vx -= x * (b = bias[i]);
            target.vy -= y * b;
            source.vx += x * (b = 1 - b);
            source.vy += y * b;
          }
        }
      }

      function initialize() {
        if (!nodes) return;

        var i,
            n = nodes.length,
            m = links.length,
            nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d])),
            link;

        for (i = 0, count = new Array(n); i < m; ++i) {
          link = links[i], link.index = i;
          if (typeof link.source !== "object") link.source = find(nodeById, link.source);
          if (typeof link.target !== "object") link.target = find(nodeById, link.target);
          count[link.source.index] = (count[link.source.index] || 0) + 1;
          count[link.target.index] = (count[link.target.index] || 0) + 1;
        }

        for (i = 0, bias = new Array(m); i < m; ++i) {
          link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
        }

        strengths = new Array(m), initializeStrength();
        distances = new Array(m), initializeDistance();
      }

      function initializeStrength() {
        if (!nodes) return;

        for (var i = 0, n = links.length; i < n; ++i) {
          strengths[i] = +strength(links[i], i, links);
        }
      }

      function initializeDistance() {
        if (!nodes) return;

        for (var i = 0, n = links.length; i < n; ++i) {
          distances[i] = +distance(links[i], i, links);
        }
      }

      force.initialize = function(_nodes, _random) {
        nodes = _nodes;
        random = _random;
        initialize();
      };

      force.links = function(_) {
        return arguments.length ? (links = _, initialize(), force) : links;
      };

      force.id = function(_) {
        return arguments.length ? (id = _, force) : id;
      };

      force.iterations = function(_) {
        return arguments.length ? (iterations = +_, force) : iterations;
      };

      force.strength = function(_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initializeStrength(), force) : strength;
      };

      force.distance = function(_) {
        return arguments.length ? (distance = typeof _ === "function" ? _ : constant(+_), initializeDistance(), force) : distance;
      };

      return force;
    }

    var noop = {value: () => {}};

    function dispatch() {
      for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
        if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
        _[t] = [];
      }
      return new Dispatch(_);
    }

    function Dispatch(_) {
      this._ = _;
    }

    function parseTypenames(typenames, types) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
        return {type: t, name: name};
      });
    }

    Dispatch.prototype = dispatch.prototype = {
      constructor: Dispatch,
      on: function(typename, callback) {
        var _ = this._,
            T = parseTypenames(typename + "", _),
            t,
            i = -1,
            n = T.length;

        // If no callback was specified, return the callback of the given type and name.
        if (arguments.length < 2) {
          while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
          return;
        }

        // If a type was specified, set the callback for the given type and name.
        // Otherwise, if a null callback was specified, remove callbacks of the given name.
        if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
        while (++i < n) {
          if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
          else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
        }

        return this;
      },
      copy: function() {
        var copy = {}, _ = this._;
        for (var t in _) copy[t] = _[t].slice();
        return new Dispatch(copy);
      },
      call: function(type, that) {
        if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      },
      apply: function(type, that, args) {
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      }
    };

    function get(type, name) {
      for (var i = 0, n = type.length, c; i < n; ++i) {
        if ((c = type[i]).name === name) {
          return c.value;
        }
      }
    }

    function set(type, name, callback) {
      for (var i = 0, n = type.length; i < n; ++i) {
        if (type[i].name === name) {
          type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
          break;
        }
      }
      if (callback != null) type.push({name: name, value: callback});
      return type;
    }

    var frame = 0, // is an animation frame pending?
        timeout = 0, // is a timeout pending?
        interval = 0, // are any timers active?
        pokeDelay = 1000, // how frequently we check for clock skew
        taskHead,
        taskTail,
        clockLast = 0,
        clockNow = 0,
        clockSkew = 0,
        clock = typeof performance === "object" && performance.now ? performance : Date,
        setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

    function now() {
      return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
    }

    function clearNow() {
      clockNow = 0;
    }

    function Timer() {
      this._call =
      this._time =
      this._next = null;
    }

    Timer.prototype = timer.prototype = {
      constructor: Timer,
      restart: function(callback, delay, time) {
        if (typeof callback !== "function") throw new TypeError("callback is not a function");
        time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
        if (!this._next && taskTail !== this) {
          if (taskTail) taskTail._next = this;
          else taskHead = this;
          taskTail = this;
        }
        this._call = callback;
        this._time = time;
        sleep();
      },
      stop: function() {
        if (this._call) {
          this._call = null;
          this._time = Infinity;
          sleep();
        }
      }
    };

    function timer(callback, delay, time) {
      var t = new Timer;
      t.restart(callback, delay, time);
      return t;
    }

    function timerFlush() {
      now(); // Get the current time, if not already set.
      ++frame; // Pretend we’ve set an alarm, if we haven’t already.
      var t = taskHead, e;
      while (t) {
        if ((e = clockNow - t._time) >= 0) t._call.call(undefined, e);
        t = t._next;
      }
      --frame;
    }

    function wake() {
      clockNow = (clockLast = clock.now()) + clockSkew;
      frame = timeout = 0;
      try {
        timerFlush();
      } finally {
        frame = 0;
        nap();
        clockNow = 0;
      }
    }

    function poke() {
      var now = clock.now(), delay = now - clockLast;
      if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
    }

    function nap() {
      var t0, t1 = taskHead, t2, time = Infinity;
      while (t1) {
        if (t1._call) {
          if (time > t1._time) time = t1._time;
          t0 = t1, t1 = t1._next;
        } else {
          t2 = t1._next, t1._next = null;
          t1 = t0 ? t0._next = t2 : taskHead = t2;
        }
      }
      taskTail = t0;
      sleep(time);
    }

    function sleep(time) {
      if (frame) return; // Soonest alarm already set, or will be.
      if (timeout) timeout = clearTimeout(timeout);
      var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
      if (delay > 24) {
        if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
        if (interval) interval = clearInterval(interval);
      } else {
        if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
        frame = 1, setFrame(wake);
      }
    }

    // https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use
    const a = 1664525;
    const c = 1013904223;
    const m = 4294967296; // 2^32

    function lcg() {
      let s = 1;
      return () => (s = (a * s + c) % m) / m;
    }

    function x(d) {
      return d.x;
    }

    function y(d) {
      return d.y;
    }

    var initialRadius = 10,
        initialAngle = Math.PI * (3 - Math.sqrt(5));

    function forceSimulation(nodes) {
      var simulation,
          alpha = 1,
          alphaMin = 0.001,
          alphaDecay = 1 - Math.pow(alphaMin, 1 / 300),
          alphaTarget = 0,
          velocityDecay = 0.6,
          forces = new Map(),
          stepper = timer(step),
          event = dispatch("tick", "end"),
          random = lcg();

      if (nodes == null) nodes = [];

      function step() {
        tick();
        event.call("tick", simulation);
        if (alpha < alphaMin) {
          stepper.stop();
          event.call("end", simulation);
        }
      }

      function tick(iterations) {
        var i, n = nodes.length, node;

        if (iterations === undefined) iterations = 1;

        for (var k = 0; k < iterations; ++k) {
          alpha += (alphaTarget - alpha) * alphaDecay;

          forces.forEach(function(force) {
            force(alpha);
          });

          for (i = 0; i < n; ++i) {
            node = nodes[i];
            if (node.fx == null) node.x += node.vx *= velocityDecay;
            else node.x = node.fx, node.vx = 0;
            if (node.fy == null) node.y += node.vy *= velocityDecay;
            else node.y = node.fy, node.vy = 0;
          }
        }

        return simulation;
      }

      function initializeNodes() {
        for (var i = 0, n = nodes.length, node; i < n; ++i) {
          node = nodes[i], node.index = i;
          if (node.fx != null) node.x = node.fx;
          if (node.fy != null) node.y = node.fy;
          if (isNaN(node.x) || isNaN(node.y)) {
            var radius = initialRadius * Math.sqrt(0.5 + i), angle = i * initialAngle;
            node.x = radius * Math.cos(angle);
            node.y = radius * Math.sin(angle);
          }
          if (isNaN(node.vx) || isNaN(node.vy)) {
            node.vx = node.vy = 0;
          }
        }
      }

      function initializeForce(force) {
        if (force.initialize) force.initialize(nodes, random);
        return force;
      }

      initializeNodes();

      return simulation = {
        tick: tick,

        restart: function() {
          return stepper.restart(step), simulation;
        },

        stop: function() {
          return stepper.stop(), simulation;
        },

        nodes: function(_) {
          return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
        },

        alpha: function(_) {
          return arguments.length ? (alpha = +_, simulation) : alpha;
        },

        alphaMin: function(_) {
          return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
        },

        alphaDecay: function(_) {
          return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
        },

        alphaTarget: function(_) {
          return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
        },

        velocityDecay: function(_) {
          return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
        },

        randomSource: function(_) {
          return arguments.length ? (random = _, forces.forEach(initializeForce), simulation) : random;
        },

        force: function(name, _) {
          return arguments.length > 1 ? ((_ == null ? forces.delete(name) : forces.set(name, initializeForce(_))), simulation) : forces.get(name);
        },

        find: function(x, y, radius) {
          var i = 0,
              n = nodes.length,
              dx,
              dy,
              d2,
              node,
              closest;

          if (radius == null) radius = Infinity;
          else radius *= radius;

          for (i = 0; i < n; ++i) {
            node = nodes[i];
            dx = x - node.x;
            dy = y - node.y;
            d2 = dx * dx + dy * dy;
            if (d2 < radius) closest = node, radius = d2;
          }

          return closest;
        },

        on: function(name, _) {
          return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
        }
      };
    }

    function forceManyBody() {
      var nodes,
          node,
          random,
          alpha,
          strength = constant(-30),
          strengths,
          distanceMin2 = 1,
          distanceMax2 = Infinity,
          theta2 = 0.81;

      function force(_) {
        var i, n = nodes.length, tree = quadtree(nodes, x, y).visitAfter(accumulate);
        for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
      }

      function initialize() {
        if (!nodes) return;
        var i, n = nodes.length, node;
        strengths = new Array(n);
        for (i = 0; i < n; ++i) node = nodes[i], strengths[node.index] = +strength(node, i, nodes);
      }

      function accumulate(quad) {
        var strength = 0, q, c, weight = 0, x, y, i;

        // For internal nodes, accumulate forces from child quadrants.
        if (quad.length) {
          for (x = y = i = 0; i < 4; ++i) {
            if ((q = quad[i]) && (c = Math.abs(q.value))) {
              strength += q.value, weight += c, x += c * q.x, y += c * q.y;
            }
          }
          quad.x = x / weight;
          quad.y = y / weight;
        }

        // For leaf nodes, accumulate forces from coincident quadrants.
        else {
          q = quad;
          q.x = q.data.x;
          q.y = q.data.y;
          do strength += strengths[q.data.index];
          while (q = q.next);
        }

        quad.value = strength;
      }

      function apply(quad, x1, _, x2) {
        if (!quad.value) return true;

        var x = quad.x - node.x,
            y = quad.y - node.y,
            w = x2 - x1,
            l = x * x + y * y;

        // Apply the Barnes-Hut approximation if possible.
        // Limit forces for very close nodes; randomize direction if coincident.
        if (w * w / theta2 < l) {
          if (l < distanceMax2) {
            if (x === 0) x = jiggle(random), l += x * x;
            if (y === 0) y = jiggle(random), l += y * y;
            if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
            node.vx += x * quad.value * alpha / l;
            node.vy += y * quad.value * alpha / l;
          }
          return true;
        }

        // Otherwise, process points directly.
        else if (quad.length || l >= distanceMax2) return;

        // Limit forces for very close nodes; randomize direction if coincident.
        if (quad.data !== node || quad.next) {
          if (x === 0) x = jiggle(random), l += x * x;
          if (y === 0) y = jiggle(random), l += y * y;
          if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
        }

        do if (quad.data !== node) {
          w = strengths[quad.data.index] * alpha / l;
          node.vx += x * w;
          node.vy += y * w;
        } while (quad = quad.next);
      }

      force.initialize = function(_nodes, _random) {
        nodes = _nodes;
        random = _random;
        initialize();
      };

      force.strength = function(_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
      };

      force.distanceMin = function(_) {
        return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
      };

      force.distanceMax = function(_) {
        return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
      };

      force.theta = function(_) {
        return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
      };

      return force;
    }

    function forceRadial(radius, x, y) {
      var nodes,
          strength = constant(0.1),
          strengths,
          radiuses;

      if (typeof radius !== "function") radius = constant(+radius);
      if (x == null) x = 0;
      if (y == null) y = 0;

      function force(alpha) {
        for (var i = 0, n = nodes.length; i < n; ++i) {
          var node = nodes[i],
              dx = node.x - x || 1e-6,
              dy = node.y - y || 1e-6,
              r = Math.sqrt(dx * dx + dy * dy),
              k = (radiuses[i] - r) * strengths[i] * alpha / r;
          node.vx += dx * k;
          node.vy += dy * k;
        }
      }

      function initialize() {
        if (!nodes) return;
        var i, n = nodes.length;
        strengths = new Array(n);
        radiuses = new Array(n);
        for (i = 0; i < n; ++i) {
          radiuses[i] = +radius(nodes[i], i, nodes);
          strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
        }
      }

      force.initialize = function(_) {
        nodes = _, initialize();
      };

      force.strength = function(_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
      };

      force.radius = function(_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), initialize(), force) : radius;
      };

      force.x = function(_) {
        return arguments.length ? (x = +_, force) : x;
      };

      force.y = function(_) {
        return arguments.length ? (y = +_, force) : y;
      };

      return force;
    }

    function forceX(x) {
      var strength = constant(0.1),
          nodes,
          strengths,
          xz;

      if (typeof x !== "function") x = constant(x == null ? 0 : +x);

      function force(alpha) {
        for (var i = 0, n = nodes.length, node; i < n; ++i) {
          node = nodes[i], node.vx += (xz[i] - node.x) * strengths[i] * alpha;
        }
      }

      function initialize() {
        if (!nodes) return;
        var i, n = nodes.length;
        strengths = new Array(n);
        xz = new Array(n);
        for (i = 0; i < n; ++i) {
          strengths[i] = isNaN(xz[i] = +x(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
        }
      }

      force.initialize = function(_) {
        nodes = _;
        initialize();
      };

      force.strength = function(_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
      };

      force.x = function(_) {
        return arguments.length ? (x = typeof _ === "function" ? _ : constant(+_), initialize(), force) : x;
      };

      return force;
    }

    function forceY(y) {
      var strength = constant(0.1),
          nodes,
          strengths,
          yz;

      if (typeof y !== "function") y = constant(y == null ? 0 : +y);

      function force(alpha) {
        for (var i = 0, n = nodes.length, node; i < n; ++i) {
          node = nodes[i], node.vy += (yz[i] - node.y) * strengths[i] * alpha;
        }
      }

      function initialize() {
        if (!nodes) return;
        var i, n = nodes.length;
        strengths = new Array(n);
        yz = new Array(n);
        for (i = 0; i < n; ++i) {
          strengths[i] = isNaN(yz[i] = +y(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
        }
      }

      force.initialize = function(_) {
        nodes = _;
        initialize();
      };

      force.strength = function(_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
      };

      force.y = function(_) {
        return arguments.length ? (y = typeof _ === "function" ? _ : constant(+_), initialize(), force) : y;
      };

      return force;
    }

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
    ForceDirectedGraphController.defaults = helpers.merge({}, [
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
    ForceDirectedGraphController.overrides = helpers.merge({}, [
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
    class ForceDirectedGraphChart extends chart_js.Chart {
        constructor(item, config) {
            super(item, patchController('forceDirectedGraph', config, ForceDirectedGraphController, [EdgeLine, chart_js.PointElement], chart_js.LinearScale));
        }
    }
    ForceDirectedGraphChart.id = ForceDirectedGraphController.id;

    function defaultSeparation$1(a, b) {
      return a.parent === b.parent ? 1 : 2;
    }

    function meanX(children) {
      return children.reduce(meanXReduce, 0) / children.length;
    }

    function meanXReduce(x, c) {
      return x + c.x;
    }

    function maxY(children) {
      return 1 + children.reduce(maxYReduce, 0);
    }

    function maxYReduce(y, c) {
      return Math.max(y, c.y);
    }

    function leafLeft(node) {
      var children;
      while (children = node.children) node = children[0];
      return node;
    }

    function leafRight(node) {
      var children;
      while (children = node.children) node = children[children.length - 1];
      return node;
    }

    function cluster() {
      var separation = defaultSeparation$1,
          dx = 1,
          dy = 1,
          nodeSize = false;

      function cluster(root) {
        var previousNode,
            x = 0;

        // First walk, computing the initial x & y values.
        root.eachAfter(function(node) {
          var children = node.children;
          if (children) {
            node.x = meanX(children);
            node.y = maxY(children);
          } else {
            node.x = previousNode ? x += separation(node, previousNode) : 0;
            node.y = 0;
            previousNode = node;
          }
        });

        var left = leafLeft(root),
            right = leafRight(root),
            x0 = left.x - separation(left, right) / 2,
            x1 = right.x + separation(right, left) / 2;

        // Second walk, normalizing x & y to the desired size.
        return root.eachAfter(nodeSize ? function(node) {
          node.x = (node.x - root.x) * dx;
          node.y = (root.y - node.y) * dy;
        } : function(node) {
          node.x = (node.x - x0) / (x1 - x0) * dx;
          node.y = (1 - (root.y ? node.y / root.y : 1)) * dy;
        });
      }

      cluster.separation = function(x) {
        return arguments.length ? (separation = x, cluster) : separation;
      };

      cluster.size = function(x) {
        return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? null : [dx, dy]);
      };

      cluster.nodeSize = function(x) {
        return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? [dx, dy] : null);
      };

      return cluster;
    }

    function count(node) {
      var sum = 0,
          children = node.children,
          i = children && children.length;
      if (!i) sum = 1;
      else while (--i >= 0) sum += children[i].value;
      node.value = sum;
    }

    function node_count() {
      return this.eachAfter(count);
    }

    function node_each(callback, that) {
      let index = -1;
      for (const node of this) {
        callback.call(that, node, ++index, this);
      }
      return this;
    }

    function node_eachBefore(callback, that) {
      var node = this, nodes = [node], children, i, index = -1;
      while (node = nodes.pop()) {
        callback.call(that, node, ++index, this);
        if (children = node.children) {
          for (i = children.length - 1; i >= 0; --i) {
            nodes.push(children[i]);
          }
        }
      }
      return this;
    }

    function node_eachAfter(callback, that) {
      var node = this, nodes = [node], next = [], children, i, n, index = -1;
      while (node = nodes.pop()) {
        next.push(node);
        if (children = node.children) {
          for (i = 0, n = children.length; i < n; ++i) {
            nodes.push(children[i]);
          }
        }
      }
      while (node = next.pop()) {
        callback.call(that, node, ++index, this);
      }
      return this;
    }

    function node_find(callback, that) {
      let index = -1;
      for (const node of this) {
        if (callback.call(that, node, ++index, this)) {
          return node;
        }
      }
    }

    function node_sum(value) {
      return this.eachAfter(function(node) {
        var sum = +value(node.data) || 0,
            children = node.children,
            i = children && children.length;
        while (--i >= 0) sum += children[i].value;
        node.value = sum;
      });
    }

    function node_sort(compare) {
      return this.eachBefore(function(node) {
        if (node.children) {
          node.children.sort(compare);
        }
      });
    }

    function node_path(end) {
      var start = this,
          ancestor = leastCommonAncestor(start, end),
          nodes = [start];
      while (start !== ancestor) {
        start = start.parent;
        nodes.push(start);
      }
      var k = nodes.length;
      while (end !== ancestor) {
        nodes.splice(k, 0, end);
        end = end.parent;
      }
      return nodes;
    }

    function leastCommonAncestor(a, b) {
      if (a === b) return a;
      var aNodes = a.ancestors(),
          bNodes = b.ancestors(),
          c = null;
      a = aNodes.pop();
      b = bNodes.pop();
      while (a === b) {
        c = a;
        a = aNodes.pop();
        b = bNodes.pop();
      }
      return c;
    }

    function node_ancestors() {
      var node = this, nodes = [node];
      while (node = node.parent) {
        nodes.push(node);
      }
      return nodes;
    }

    function node_descendants() {
      return Array.from(this);
    }

    function node_leaves() {
      var leaves = [];
      this.eachBefore(function(node) {
        if (!node.children) {
          leaves.push(node);
        }
      });
      return leaves;
    }

    function node_links() {
      var root = this, links = [];
      root.each(function(node) {
        if (node !== root) { // Don’t include the root’s parent, if any.
          links.push({source: node.parent, target: node});
        }
      });
      return links;
    }

    function* node_iterator() {
      var node = this, current, next = [node], children, i, n;
      do {
        current = next.reverse(), next = [];
        while (node = current.pop()) {
          yield node;
          if (children = node.children) {
            for (i = 0, n = children.length; i < n; ++i) {
              next.push(children[i]);
            }
          }
        }
      } while (next.length);
    }

    function hierarchy(data, children) {
      if (data instanceof Map) {
        data = [undefined, data];
        if (children === undefined) children = mapChildren;
      } else if (children === undefined) {
        children = objectChildren;
      }

      var root = new Node(data),
          node,
          nodes = [root],
          child,
          childs,
          i,
          n;

      while (node = nodes.pop()) {
        if ((childs = children(node.data)) && (n = (childs = Array.from(childs)).length)) {
          node.children = childs;
          for (i = n - 1; i >= 0; --i) {
            nodes.push(child = childs[i] = new Node(childs[i]));
            child.parent = node;
            child.depth = node.depth + 1;
          }
        }
      }

      return root.eachBefore(computeHeight);
    }

    function node_copy() {
      return hierarchy(this).eachBefore(copyData);
    }

    function objectChildren(d) {
      return d.children;
    }

    function mapChildren(d) {
      return Array.isArray(d) ? d[1] : null;
    }

    function copyData(node) {
      if (node.data.value !== undefined) node.value = node.data.value;
      node.data = node.data.data;
    }

    function computeHeight(node) {
      var height = 0;
      do node.height = height;
      while ((node = node.parent) && (node.height < ++height));
    }

    function Node(data) {
      this.data = data;
      this.depth =
      this.height = 0;
      this.parent = null;
    }

    Node.prototype = hierarchy.prototype = {
      constructor: Node,
      count: node_count,
      each: node_each,
      eachAfter: node_eachAfter,
      eachBefore: node_eachBefore,
      find: node_find,
      sum: node_sum,
      sort: node_sort,
      path: node_path,
      ancestors: node_ancestors,
      descendants: node_descendants,
      leaves: node_leaves,
      links: node_links,
      copy: node_copy,
      [Symbol.iterator]: node_iterator
    };

    function defaultSeparation(a, b) {
      return a.parent === b.parent ? 1 : 2;
    }

    // function radialSeparation(a, b) {
    //   return (a.parent === b.parent ? 1 : 2) / a.depth;
    // }

    // This function is used to traverse the left contour of a subtree (or
    // subforest). It returns the successor of v on this contour. This successor is
    // either given by the leftmost child of v or by the thread of v. The function
    // returns null if and only if v is on the highest level of its subtree.
    function nextLeft(v) {
      var children = v.children;
      return children ? children[0] : v.t;
    }

    // This function works analogously to nextLeft.
    function nextRight(v) {
      var children = v.children;
      return children ? children[children.length - 1] : v.t;
    }

    // Shifts the current subtree rooted at w+. This is done by increasing
    // prelim(w+) and mod(w+) by shift.
    function moveSubtree(wm, wp, shift) {
      var change = shift / (wp.i - wm.i);
      wp.c -= change;
      wp.s += shift;
      wm.c += change;
      wp.z += shift;
      wp.m += shift;
    }

    // All other shifts, applied to the smaller subtrees between w- and w+, are
    // performed by this function. To prepare the shifts, we have to adjust
    // change(w+), shift(w+), and change(w-).
    function executeShifts(v) {
      var shift = 0,
          change = 0,
          children = v.children,
          i = children.length,
          w;
      while (--i >= 0) {
        w = children[i];
        w.z += shift;
        w.m += shift;
        shift += w.s + (change += w.c);
      }
    }

    // If vi-’s ancestor is a sibling of v, returns vi-’s ancestor. Otherwise,
    // returns the specified (default) ancestor.
    function nextAncestor(vim, v, ancestor) {
      return vim.a.parent === v.parent ? vim.a : ancestor;
    }

    function TreeNode(node, i) {
      this._ = node;
      this.parent = null;
      this.children = null;
      this.A = null; // default ancestor
      this.a = this; // ancestor
      this.z = 0; // prelim
      this.m = 0; // mod
      this.c = 0; // change
      this.s = 0; // shift
      this.t = null; // thread
      this.i = i; // number
    }

    TreeNode.prototype = Object.create(Node.prototype);

    function treeRoot(root) {
      var tree = new TreeNode(root, 0),
          node,
          nodes = [tree],
          child,
          children,
          i,
          n;

      while (node = nodes.pop()) {
        if (children = node._.children) {
          node.children = new Array(n = children.length);
          for (i = n - 1; i >= 0; --i) {
            nodes.push(child = node.children[i] = new TreeNode(children[i], i));
            child.parent = node;
          }
        }
      }

      (tree.parent = new TreeNode(null, 0)).children = [tree];
      return tree;
    }

    // Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
    function tree() {
      var separation = defaultSeparation,
          dx = 1,
          dy = 1,
          nodeSize = null;

      function tree(root) {
        var t = treeRoot(root);

        // Compute the layout using Buchheim et al.’s algorithm.
        t.eachAfter(firstWalk), t.parent.m = -t.z;
        t.eachBefore(secondWalk);

        // If a fixed node size is specified, scale x and y.
        if (nodeSize) root.eachBefore(sizeNode);

        // If a fixed tree size is specified, scale x and y based on the extent.
        // Compute the left-most, right-most, and depth-most nodes for extents.
        else {
          var left = root,
              right = root,
              bottom = root;
          root.eachBefore(function(node) {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
            if (node.depth > bottom.depth) bottom = node;
          });
          var s = left === right ? 1 : separation(left, right) / 2,
              tx = s - left.x,
              kx = dx / (right.x + s + tx),
              ky = dy / (bottom.depth || 1);
          root.eachBefore(function(node) {
            node.x = (node.x + tx) * kx;
            node.y = node.depth * ky;
          });
        }

        return root;
      }

      // Computes a preliminary x-coordinate for v. Before that, FIRST WALK is
      // applied recursively to the children of v, as well as the function
      // APPORTION. After spacing out the children by calling EXECUTE SHIFTS, the
      // node v is placed to the midpoint of its outermost children.
      function firstWalk(v) {
        var children = v.children,
            siblings = v.parent.children,
            w = v.i ? siblings[v.i - 1] : null;
        if (children) {
          executeShifts(v);
          var midpoint = (children[0].z + children[children.length - 1].z) / 2;
          if (w) {
            v.z = w.z + separation(v._, w._);
            v.m = v.z - midpoint;
          } else {
            v.z = midpoint;
          }
        } else if (w) {
          v.z = w.z + separation(v._, w._);
        }
        v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
      }

      // Computes all real x-coordinates by summing up the modifiers recursively.
      function secondWalk(v) {
        v._.x = v.z + v.parent.m;
        v.m += v.parent.m;
      }

      // The core of the algorithm. Here, a new subtree is combined with the
      // previous subtrees. Threads are used to traverse the inside and outside
      // contours of the left and right subtree up to the highest common level. The
      // vertices used for the traversals are vi+, vi-, vo-, and vo+, where the
      // superscript o means outside and i means inside, the subscript - means left
      // subtree and + means right subtree. For summing up the modifiers along the
      // contour, we use respective variables si+, si-, so-, and so+. Whenever two
      // nodes of the inside contours conflict, we compute the left one of the
      // greatest uncommon ancestors using the function ANCESTOR and call MOVE
      // SUBTREE to shift the subtree and prepare the shifts of smaller subtrees.
      // Finally, we add a new thread (if necessary).
      function apportion(v, w, ancestor) {
        if (w) {
          var vip = v,
              vop = v,
              vim = w,
              vom = vip.parent.children[0],
              sip = vip.m,
              sop = vop.m,
              sim = vim.m,
              som = vom.m,
              shift;
          while (vim = nextRight(vim), vip = nextLeft(vip), vim && vip) {
            vom = nextLeft(vom);
            vop = nextRight(vop);
            vop.a = v;
            shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
            if (shift > 0) {
              moveSubtree(nextAncestor(vim, v, ancestor), v, shift);
              sip += shift;
              sop += shift;
            }
            sim += vim.m;
            sip += vip.m;
            som += vom.m;
            sop += vop.m;
          }
          if (vim && !nextRight(vop)) {
            vop.t = vim;
            vop.m += sim - sop;
          }
          if (vip && !nextLeft(vom)) {
            vom.t = vip;
            vom.m += sip - som;
            ancestor = v;
          }
        }
        return ancestor;
      }

      function sizeNode(node) {
        node.x *= dx;
        node.y = node.depth * dy;
      }

      tree.separation = function(x) {
        return arguments.length ? (separation = x, tree) : separation;
      };

      tree.size = function(x) {
        return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], tree) : (nodeSize ? null : [dx, dy]);
      };

      tree.nodeSize = function(x) {
        return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], tree) : (nodeSize ? [dx, dy] : null);
      };

      return tree;
    }

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
    DendrogramController.defaults = helpers.merge({}, [
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
    DendrogramController.overrides = helpers.merge({}, [
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
    class DendrogramChart extends chart_js.Chart {
        constructor(item, config) {
            super(item, patchController('dendrogram', config, DendrogramController, [EdgeLine, chart_js.PointElement], chart_js.LinearScale));
        }
    }
    DendrogramChart.id = DendrogramController.id;
    class DendogramController extends DendrogramController {
    }
    DendogramController.id = 'dendogram';
    DendogramController.defaults = helpers.merge({}, [
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
    TreeController.defaults = helpers.merge({}, [
        DendrogramController.defaults,
        {
            tree: {
                mode: 'tree',
            },
        },
    ]);
    TreeController.overrides = DendrogramController.overrides;
    class TreeChart extends chart_js.Chart {
        constructor(item, config) {
            super(item, patchController('tree', config, TreeController, [EdgeLine, chart_js.PointElement], chart_js.LinearScale));
        }
    }
    TreeChart.id = TreeController.id;

    chart_js.registry.addControllers(DendrogramController, DendogramController, ForceDirectedGraphController, GraphController, TreeController);
    chart_js.registry.addElements(EdgeLine);

    exports.DendogramChart = DendogramChart;
    exports.DendogramController = DendogramController;
    exports.DendrogramChart = DendrogramChart;
    exports.DendrogramController = DendrogramController;
    exports.EdgeLine = EdgeLine;
    exports.ForceDirectedGraphChart = ForceDirectedGraphChart;
    exports.ForceDirectedGraphController = ForceDirectedGraphController;
    exports.GraphChart = GraphChart;
    exports.GraphController = GraphController;
    exports.TreeChart = TreeChart;
    exports.TreeController = TreeController;

}));
//# sourceMappingURL=index.umd.js.map
