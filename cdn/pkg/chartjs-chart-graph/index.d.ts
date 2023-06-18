/**
 * chartjs-chart-graph
 * https://github.com/sgratzl/chartjs-chart-graph
 *
 * Copyright (c) 2019-2022 Samuel Gratzl <sam@sgratzl.com>
 */

import { ChartType, ScriptableAndArrayOptions, ScriptableContext, LineOptions, LineElement, PointElement, CoreChartOptions, CartesianScaleTypeRegistry, ScatterController, UpdateMode, Element, ControllerDatasetOptions, PointPrefixedOptions, PointPrefixedHoverOptions, LineHoverOptions, Chart, ChartItem, ChartConfiguration } from 'chart.js';
import { HierarchyNode } from 'd3-hierarchy';

interface IEdgeLineOptions extends LineOptions {
    directed: boolean;
    arrowHeadSize: number;
    arrowHeadOffset: number;
}
interface IEdgeLineProps extends LineOptions {
    points: {
        x: number;
        y: number;
    }[];
}
declare class EdgeLine extends LineElement {
    _orientation: 'vertical' | 'radial' | 'horizontal';
    source: PointElement;
    target: PointElement;
    options: IEdgeLineOptions;
    draw(ctx: CanvasRenderingContext2D): void;
    static readonly id = "edgeLine";
    static readonly defaults: any;
    static readonly defaultRoutes: {
        [property: string]: string;
    } | undefined;
    static readonly descriptors: {
        _scriptable: boolean;
        _indexable: (name: keyof IEdgeLineOptions) => boolean;
    };
}
declare module 'chart.js' {
    interface ElementOptionsByType<TType extends ChartType> {
        edgeLine: ScriptableAndArrayOptions<IEdgeLineOptions, ScriptableContext<TType>>;
    }
}

type AnyObject = Record<string, unknown>;
interface IExtendedChartMeta {
    edges: EdgeLine[];
    _parsedEdges: ITreeEdge[];
}
interface ITreeNode extends IGraphDataPoint {
    x: number;
    y: number;
    index?: number;
}
interface ITreeEdge {
    source: number;
    target: number;
    points?: {
        x: number;
        y: number;
    }[];
}
declare class GraphController extends ScatterController {
    _ctx: CanvasRenderingContext2D;
    _cachedDataOpts: any;
    _type: string;
    _data: any[];
    _edges: any[];
    _sharedOptions: any;
    _edgeSharedOptions: any;
    dataElementType: any;
    private _scheduleResyncLayoutId;
    edgeElementType: any;
    private readonly _edgeListener;
    initialize(): void;
    parse(start: number, count: number): void;
    reset(): void;
    update(mode: UpdateMode): void;
    destroy(): void;
    updateEdgeElements(edges: EdgeLine[], start: number, mode: UpdateMode): void;
    updateEdgeElement(edge: EdgeLine, index: number, properties: any, mode: UpdateMode): void;
    updateElement(point: Element<AnyObject, AnyObject>, index: number, properties: any, mode: UpdateMode): void;
    resolveNodeIndex(nodes: any[], ref: string | number | any): number;
    buildOrUpdateElements(): void;
    draw(): void;
    protected _resyncElements(): void;
    getTreeRootIndex(): number;
    getTreeRoot(): ITreeNode;
    getTreeChildren(node: {
        index?: number;
    }): ITreeNode[];
    _parseDefinedEdge(edge: {
        source: number;
        target: number;
    }): ITreeEdge;
    _parseEdges(): ITreeEdge[];
    addElements(): void;
    _resyncEdgeElements(): void;
    _insertElements(start: number, count: number): void;
    _removeElements(start: number, count: number): void;
    _insertEdgeElements(start: number, count: number): void;
    reLayout(): void;
    resetLayout(): void;
    stopLayout(): void;
    _scheduleResyncLayout(): void;
    resyncLayout(): void;
    static readonly id: string;
    static readonly defaults: any;
    static readonly overrides: any;
}
interface IGraphDataPoint {
    parent?: number;
}
interface IGraphEdgeDataPoint {
    source: number;
    target: number;
}
interface IGraphChartControllerDatasetOptions extends ControllerDatasetOptions, ScriptableAndArrayOptions<PointPrefixedOptions, ScriptableContext<'graph'>>, ScriptableAndArrayOptions<PointPrefixedHoverOptions, ScriptableContext<'graph'>>, ScriptableAndArrayOptions<IEdgeLineOptions, ScriptableContext<'graph'>>, ScriptableAndArrayOptions<LineHoverOptions, ScriptableContext<'graph'>> {
    edges: IGraphEdgeDataPoint[];
}
declare module 'chart.js' {
    interface ChartTypeRegistry {
        graph: {
            chartOptions: CoreChartOptions<'graph'>;
            datasetOptions: IGraphChartControllerDatasetOptions;
            defaultDataPoint: IGraphDataPoint;
            metaExtensions: Record<string, never>;
            parsedDataType: ITreeNode;
            scales: keyof CartesianScaleTypeRegistry;
        };
    }
}
declare class GraphChart<DATA extends unknown[] = IGraphDataPoint[], LABEL = string> extends Chart<'graph', DATA, LABEL> {
    static id: string;
    constructor(item: ChartItem, config: Omit<ChartConfiguration<'graph', DATA, LABEL>, 'type'>);
}

interface ITreeSimNode extends ITreeNode {
    _sim: {
        x?: number;
        y?: number;
        vx?: number;
        vy?: number;
        index?: number;
    };
    reset?: boolean;
}
interface IForceDirectedControllerOptions {
    simulation: {
        autoRestart: boolean;
        initialIterations: number;
        forces: {
            center: boolean | ICenterForce;
            collide: boolean | ICollideForce;
            link: boolean | ILinkForce;
            manyBody: boolean | IManyBodyForce;
            x: boolean | IForceXForce;
            y: boolean | IForceYForce;
            radial: boolean | IRadialForce;
        };
    };
}
declare type ID3NodeCallback = (d: any, i: number) => number;
declare type ID3EdgeCallback = (d: any, i: number) => number;
interface ICenterForce {
    x?: number;
    y?: number;
}
interface ICollideForce {
    radius?: number | ID3NodeCallback;
    strength?: number | ID3NodeCallback;
}
interface ILinkForce {
    id?: (d: {
        source: any;
        target: any;
    }) => string | number;
    distance?: number | ID3EdgeCallback;
    strength?: number | ID3EdgeCallback;
}
interface IManyBodyForce {
    strength?: number | ID3NodeCallback;
    theta?: number;
    distanceMin?: number;
    distanceMax?: number;
}
interface IForceXForce {
    x?: number;
    strength?: number;
}
interface IForceYForce {
    y?: number;
    strength?: number;
}
interface IRadialForce {
    x?: number;
    y?: number;
    radius?: number;
    strength?: number;
}
declare class ForceDirectedGraphController extends GraphController {
    options: IForceDirectedControllerOptions;
    private readonly _simulation;
    constructor(chart: Chart, datasetIndex: number);
    _copyPosition(): void;
    resetLayout(): void;
    resyncLayout(): void;
    reLayout(): void;
    stopLayout(): void;
    static readonly id = "forceDirectedGraph";
    static readonly defaults: any;
    static readonly overrides: any;
}
interface IForceDirectedGraphChartControllerDatasetOptions extends IGraphChartControllerDatasetOptions, IForceDirectedControllerOptions {
}
declare module 'chart.js' {
    interface ChartTypeRegistry {
        forceDirectedGraph: {
            chartOptions: CoreChartOptions<'forceDirectedGraph'>;
            datasetOptions: IForceDirectedGraphChartControllerDatasetOptions;
            defaultDataPoint: IGraphDataPoint;
            metaExtensions: Record<string, never>;
            parsedDataType: ITreeSimNode;
            scales: keyof CartesianScaleTypeRegistry;
        };
    }
}
declare class ForceDirectedGraphChart<DATA extends unknown[] = IGraphDataPoint[], LABEL = string> extends Chart<'forceDirectedGraph', DATA, LABEL> {
    static id: string;
    constructor(item: ChartItem, config: Omit<ChartConfiguration<'forceDirectedGraph', DATA, LABEL>, 'type'>);
}

interface ITreeOptions {
    mode: 'dendrogram' | 'tree' | 'dendrogram';
    orientation: 'horizontal' | 'vertical' | 'radial';
}
declare class DendrogramController extends GraphController {
    options: {
        tree: ITreeOptions;
    };
    updateEdgeElement(line: EdgeLine, index: number, properties: any, mode: UpdateMode): void;
    updateElement(point: Element<AnyObject, AnyObject>, index: number, properties: any, mode: UpdateMode): void;
    resyncLayout(): void;
    reLayout(newOptions?: Partial<ITreeOptions>): void;
    doLayout(root: HierarchyNode<{
        x: number;
        y: number;
        angle?: number;
    }>): void;
    static readonly id: string;
    static readonly defaults: any;
    static readonly overrides: any;
}
interface IDendrogramChartControllerDatasetOptions extends IGraphChartControllerDatasetOptions {
    tree: ITreeOptions;
}
declare module 'chart.js' {
    interface ChartTypeRegistry {
        dendogram: {
            chartOptions: CoreChartOptions<'dendrogram'>;
            datasetOptions: IDendrogramChartControllerDatasetOptions;
            defaultDataPoint: IGraphDataPoint[];
            metaExtensions: Record<string, never>;
            parsedDataType: ITreeNode & {
                angle?: number;
            };
            scales: keyof CartesianScaleTypeRegistry;
        };
        dendrogram: {
            chartOptions: CoreChartOptions<'dendrogram'>;
            datasetOptions: IDendrogramChartControllerDatasetOptions;
            defaultDataPoint: IGraphDataPoint[];
            metaExtensions: Record<string, never>;
            parsedDataType: ITreeNode & {
                angle?: number;
            };
            scales: keyof CartesianScaleTypeRegistry;
        };
    }
}
declare class DendrogramChart<DATA extends unknown[] = IGraphDataPoint[], LABEL = string> extends Chart<'dendrogram', DATA, LABEL> {
    static id: string;
    constructor(item: ChartItem, config: Omit<ChartConfiguration<'dendrogram', DATA, LABEL>, 'type'>);
}
declare class DendogramController extends DendrogramController {
    static readonly id: string;
    static readonly defaults: any;
}
declare const DendogramChart: typeof DendrogramChart;

declare class TreeController extends DendrogramController {
    static readonly id = "tree";
    static readonly defaults: any;
    static readonly overrides: any;
}
declare module 'chart.js' {
    interface ChartTypeRegistry {
        tree: {
            chartOptions: CoreChartOptions<'tree'>;
            datasetOptions: IDendrogramChartControllerDatasetOptions;
            defaultDataPoint: IGraphDataPoint;
            metaExtensions: Record<string, never>;
            parsedDataType: ITreeNode;
            scales: keyof CartesianScaleTypeRegistry;
        };
    }
}
declare class TreeChart<DATA extends unknown[] = IGraphDataPoint[], LABEL = string> extends Chart<'tree', DATA, LABEL> {
    static id: string;
    constructor(item: ChartItem, config: Omit<ChartConfiguration<'tree', DATA, LABEL>, 'type'>);
}

export { AnyObject, DendogramChart, DendogramController, DendrogramChart, DendrogramController, EdgeLine, ForceDirectedGraphChart, ForceDirectedGraphController, GraphChart, GraphController, ICenterForce, ICollideForce, IDendrogramChartControllerDatasetOptions, IEdgeLineOptions, IEdgeLineProps, IExtendedChartMeta, IForceDirectedControllerOptions, IForceDirectedGraphChartControllerDatasetOptions, IForceXForce, IForceYForce, IGraphChartControllerDatasetOptions, IGraphDataPoint, IGraphEdgeDataPoint, ILinkForce, IManyBodyForce, IRadialForce, ITreeEdge, ITreeNode, ITreeOptions, ITreeSimNode, TreeChart, TreeController };
//# sourceMappingURL=index.d.ts.map
