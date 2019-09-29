import {AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import * as PIXI from 'pixi.js';
import * as d3 from 'd3';
import {Viewport} from 'pixi-viewport';
import {GlowFilter} from 'pixi-filters';
import {GraphAlgorithmService} from './graph-algorithm.service';
import {CommunityDetectionRequest} from './community-detection-request';
import {GraphData} from '../shared/graph-data';

@Component({
  selector: 'app-graph-show',
  templateUrl: './graph-show.component.html',
  styleUrls: ['./graph-show.component.css']
})
export class GraphShowComponent implements OnInit, AfterViewInit {
  @Input()
  title: string;
  @Input()
  showModularity: 'yes' | 'no';
  @Input()
  algorithm: string;
  @Input()
  level: number;
  @Input()
  graphData: GraphData;

  @ViewChild('graphDiv', {static: true})
  graphDiv: ElementRef;
  @ViewChild('chartDiv', {static: false})
  chartDiv: ElementRef;
  svg: d3.Selection; // 模块度折线图
  cur: d3.Selection; // 模块度折线图，当前指针
  y: any;
  x: any;

  TYPE = 'WebGL';
  RESOLUTION = 1; // 分辨率，设为1可以默认显示全部节点，可以设置为 window.devicePixelRatio * 2
  FORCE_LAYOUT_NODE_REPULSION_STRENGTH = 250;
  FORCE_LAYOUT_ITERATIONS = 300;
  NODE_RADIUS = 15;
  NODE_HIT_RADIUS = this.NODE_RADIUS + 5;
  ICON_FONT_FAMILY = 'Material Icons'; // 节点图标字体
  ICON_FONT_SIZE = this.NODE_RADIUS / Math.SQRT2 * 2;
  ICON_TEXT = 'person';
  LABEL_FONT_FAMILY = 'Helvetica'; // 节点标签字体
  LABEL_FONT_SIZE = 12;
  LABEL_X_PADDING = 2;
  LABEL_Y_PADDING = 1;
  LINE_ALPHA = 0.6;
  LABEL_TEXT = nodeData => nodeData.id;

  app: PIXI.Application;
  viewport: Viewport;
  nodeContainer: PIXI.ParticleContainer;
  nodes: Set<any>;
  links: Set<any>;
  renderRequestId;
  colorScale = d3.scaleOrdinal(d3.schemePaired); // 颜色序列（An array of twelve categorical colors represented as RGB hexadecimal strings.）
  // colorScale = d3.scaleOrdinal(d3.schemeTableau10);
  // linksLayer = new PIXI.Graphics();
  linksLayer = new PIXI.Container();

  // 显示: links, nodes, labels, front
  nodesLayer = new PIXI.Container();
  labelsLayer = new PIXI.Container();
  frontLayer = new PIXI.Container();
  // 状态
  nodeDataToNodeGfx = new WeakMap();
  nodeGfxToNodeData = new WeakMap();
  nodeDataToLabelGfx = new WeakMap();
  labelGfxToNodeData = new WeakMap();
  nodeDataToCircle = new WeakMap();
  circleToNodeData = new WeakMap();
  indexToNodeData = new Map();
  linkDataToLineGfx = new WeakMap();
  lineGfxToLinkData = new WeakMap();
  lineGfxToFilter = new WeakMap();
  linkDataToLine = new WeakMap();
  lineToLinkData = new WeakMap();
  indexToLinkData = new Map();
  hoveredNodeData;
  hoveredNodeGfxOriginalChildren;
  hoveredLabelGfxOriginalChildren;
  clickedNodeData;
  clickedLineData;

  resultData = [];

  chartData = [
    {iteration: 1, modularity: -2.2134193212463565e-17},
    {iteration: 100, modularity: 1},
  ];
  CHART_SCREEN_WIDTH = 800; // 默认值，会在initConfig()函数中被修改
  CHART_SCREEN_HEIGHT = 600; // 默认值，会在initConfig()函数中被修改

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              public graphAlgorithmService: GraphAlgorithmService
  ) {
    if (!PIXI.utils.isWebGLSupported()) {
      this.TYPE = 'canvas';
    }

    PIXI.utils.sayHello(this.TYPE);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initConfig();
    this.initGraphics();
    this.initData();
  }

  initConfig() {
    if ('yes' === this.showModularity) {
      this.CHART_SCREEN_WIDTH = this.chartDiv.nativeElement.offsetWidth;
      this.CHART_SCREEN_HEIGHT = this.chartDiv.nativeElement.offsetHeight;
    }
  }

  /**
   * 初始化图表
   */
  initGraphics() {
    const GRAPH_SCREEN_WIDTH = this.graphDiv.nativeElement.offsetWidth;
    const GRAPH_SCREEN_HEIGHT = this.graphDiv.nativeElement.offsetHeight;
    const GRAPH_WORLD_WIDTH = GRAPH_SCREEN_WIDTH * 2;
    const GRAPH_WORLD_HEIGHT = GRAPH_SCREEN_WIDTH * 2;

    this.app = new PIXI.Application({
      width: GRAPH_SCREEN_WIDTH,
      height: GRAPH_SCREEN_HEIGHT,
      resolution: this.RESOLUTION,
      transparent: true,
      antialias: true,
      autoStart: false, // 不通过ticker进行绘制，仅在需要时手动进行绘制
      forceCanvas: false,
      // resizeTo: this.graphDivGrivanNewman.nativeElement
    });

    this.renderer.appendChild(this.graphDiv.nativeElement, this.app.view);

    // 修改画布颜色、大小
    // this.app.renderer.backgroundColor = 0xFFFFFF;
    // this.app.renderer.resize(512, 512);

    // 让画布占据整个窗口
    // this.app.renderer.view.style.position = 'absolute';
    // this.app.renderer.view.style.display = 'block';
    // this.app.renderer.resize(window.innerWidth, window.innerHeight);

    this.nodeContainer = new PIXI.ParticleContainer();
    this.app.stage.addChild(this.nodeContainer);

    this.initForceLayout(this.graphData, {
      iterations: this.FORCE_LAYOUT_ITERATIONS,
      nodeRepulsionStrength: this.FORCE_LAYOUT_NODE_REPULSION_STRENGTH,
    });
    this.nodes.forEach(nodeData => {
      nodeData.x += GRAPH_WORLD_WIDTH / 2;
      nodeData.y += GRAPH_WORLD_HEIGHT / 2;
    });

    this.viewport = new Viewport({
      screenWidth: GRAPH_SCREEN_WIDTH,
      screenHeight: GRAPH_SCREEN_HEIGHT,
      worldWidth: GRAPH_WORLD_WIDTH,
      worldHeight: GRAPH_WORLD_HEIGHT,
      interaction: this.app.renderer.plugins.interaction
    });
    const zoomIn = () => {
      this.viewport.zoom(-GRAPH_WORLD_WIDTH / 10, true);
    };
    const zoomOut = () => {
      this.viewport.zoom(GRAPH_WORLD_WIDTH / 10, true);
    };
    const resetViewport = () => {
      this.viewport.center = new PIXI.Point(GRAPH_WORLD_WIDTH / 2, GRAPH_WORLD_HEIGHT / 2);
      this.viewport.setZoom(0.5, true);
    };
    this.app.stage.addChild(this.viewport);
    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate();
    // Viewport 框架中主动声明的事件类型中并没有 frame-end
    // @ts-ignore
    this.viewport.on('frame-end', () => {
      if (this.viewport.dirty) {
        this.requestRender();
        this.viewport.dirty = false;
      }
    });

    this.viewport.addChild(this.linksLayer);
    this.viewport.addChild(this.nodesLayer);
    this.viewport.addChild(this.labelsLayer);
    this.viewport.addChild(this.frontLayer);

    // 绘制节点
    const nodeDataGfxPairs = [];
    this.nodes.forEach(nodeData => {
      const nodeGfx = new PIXI.Container();
      nodeGfx.x = nodeData.x;
      nodeGfx.y = nodeData.y;
      nodeGfx.interactive = true;
      nodeGfx.buttonMode = true;
      nodeGfx.hitArea = new PIXI.Circle(0, 0, this.NODE_HIT_RADIUS);
      nodeGfx.on('mouseover', event => this.hoverNodeStart(this.nodeGfxToNodeData.get(event.currentTarget)));
      nodeGfx.on('mouseout', event => this.hoverNodeEnd(this.nodeGfxToNodeData.get(event.currentTarget)));
      nodeGfx.on('mousedown', event => this.clickNodeStart(this.nodeGfxToNodeData.get(event.currentTarget)));
      nodeGfx.on('mouseup', () => this.clickNodeEnd());
      nodeGfx.on('mouseupoutside', () => this.clickNodeEnd());

      const circle = new PIXI.Graphics();
      circle.x = 0;
      circle.y = 0;
      circle.beginFill(this.colorToNumber(this.color(nodeData)));
      circle.drawCircle(0, 0, this.NODE_RADIUS);
      nodeGfx.addChild(circle);

      const circleBorder = new PIXI.Graphics();
      circle.x = 0;
      circle.y = 0;
      circleBorder.lineStyle(1.5, 0xffffff);
      circleBorder.drawCircle(0, 0, this.NODE_RADIUS);
      nodeGfx.addChild(circleBorder);

      // 绘制节点图标
      // const icon = new PIXI.Text(this.ICON_TEXT, {
      //   fontFamily: this.ICON_FONT_FAMILY,
      //   fontSize: this.ICON_FONT_SIZE,
      //   fill: 0xffffff
      // });
      // icon.x = 0;
      // icon.y = 0;
      // icon.anchor.set(0.5);
      // nodeGfx.addChild(icon);

      const labelGfx = new PIXI.Container();
      labelGfx.x = nodeData.x;
      labelGfx.y = nodeData.y;
      labelGfx.interactive = true;
      labelGfx.buttonMode = true;
      labelGfx.on('mouseover', event => this.hoverNodeStart(this.labelGfxToNodeData.get(event.currentTarget)));
      labelGfx.on('mouseout', event => this.hoverNodeEnd(this.labelGfxToNodeData.get(event.currentTarget)));
      labelGfx.on('mousedown', event => this.clickNodeStart(this.labelGfxToNodeData.get(event.currentTarget)));
      labelGfx.on('mouseup', () => this.clickNodeEnd());
      labelGfx.on('mouseupoutside', () => this.clickNodeEnd());

      const labelText = new PIXI.Text(this.LABEL_TEXT(nodeData), {
        fontFamily: this.LABEL_FONT_FAMILY,
        fontSize: this.LABEL_FONT_SIZE,
        fill: 0x333333
      });
      labelText.x = 0;
      labelText.y = this.NODE_HIT_RADIUS + this.LABEL_Y_PADDING;
      labelText.anchor.set(0.5, 0);
      const labelBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
      labelBackground.x = -(labelText.width + this.LABEL_X_PADDING * 2) / 2;
      labelBackground.y = this.NODE_HIT_RADIUS;
      labelBackground.width = labelText.width + this.LABEL_X_PADDING * 2;
      labelBackground.height = labelText.height + this.LABEL_Y_PADDING * 2;
      labelBackground.tint = 0xffffff;
      labelBackground.alpha = 0.5;
      labelGfx.addChild(labelBackground);
      labelGfx.addChild(labelText);

      this.nodesLayer.addChild(nodeGfx);
      this.labelsLayer.addChild(labelGfx);

      nodeDataGfxPairs.push([nodeData, nodeGfx, labelGfx, circle]);
    });

    // 绘制边
    const linkDataGfxPairs = [];
    this.links.forEach(linkData => {
      const lineWidth = linkData.value ? Math.sqrt(linkData.value) : 1;
      const [deltaX, deltaY] = this.deltaXY(linkData.source.x, linkData.source.y, linkData.target.x, linkData.target.y, lineWidth);
      const lineGfx = new PIXI.Container();
      lineGfx.interactive = true;
      lineGfx.buttonMode = true;
      lineGfx.hitArea = new PIXI.Polygon([
        new PIXI.Point(linkData.source.x - deltaX, linkData.source.y + deltaY),
        new PIXI.Point(linkData.target.x - deltaX, linkData.target.y + deltaY),
        new PIXI.Point(linkData.target.x + deltaX, linkData.target.y - deltaY),
        new PIXI.Point(linkData.source.x + deltaX, linkData.source.y - deltaY)
      ]);
      lineGfx.on('mousedown', event => this.clickLineStart(this.lineGfxToLinkData.get(event.currentTarget)));
      lineGfx.on('mouseup', () => this.clickLineEnd());
      lineGfx.on('mouseupoutside', () => this.clickLineEnd());

      const line = new PIXI.Graphics();
      line.alpha = this.LINE_ALPHA;
      line.lineStyle(lineWidth, 0xE0FFFF);
      line.moveTo(linkData.source.x, linkData.source.y);
      line.lineTo(linkData.target.x, linkData.target.y);
      lineGfx.addChild(line);
      this.linksLayer.addChild(lineGfx);
      linkDataGfxPairs.push([linkData, lineGfx, line, linkData.source.index.toString() + '_' + linkData.target.index.toString()]);
    });

    // 索引
    this.nodeDataToNodeGfx = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [nodeData, nodeGfx]));
    this.nodeGfxToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [nodeGfx, nodeData]));
    this.nodeDataToLabelGfx = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [nodeData, labelGfx]));
    this.labelGfxToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [labelGfx, nodeData]));
    this.nodeDataToCircle = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [nodeData, circle]));
    this.circleToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [circle, nodeData]));
    this.indexToNodeData = new Map(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [nodeData.index, nodeData]));

    this.linkDataToLineGfx = new WeakMap(linkDataGfxPairs.map(([linkData, lineGfx, line]) => [linkData, lineGfx]));
    this.lineGfxToLinkData = new WeakMap(linkDataGfxPairs.map(([linkData, lineGfx, line]) => [lineGfx, linkData]));
    this.linkDataToLine = new WeakMap(linkDataGfxPairs.map(([linkData, lineGfx, line]) => [linkData, line]));
    this.lineToLinkData = new WeakMap(linkDataGfxPairs.map(([linkData, lineGfx, line]) => [line, linkData]));
    this.indexToLinkData = new Map(
      linkDataGfxPairs.map(([linkData, lineGfx, line, key]) => [key, linkData]));

    // 初始化可视区域
    resetViewport();
    this.update();

    // 阻止默认鼠标滚动行为
    this.app.view.addEventListener('wheel', event => {
      event.preventDefault();
    });
  }

  /**
   * 请求社群发现的数据
   */
  initData(): Promise<any> {
    this.chartData = [];
    const requestData = new CommunityDetectionRequest();
    requestData.num_nodes = this.nodes.size;
    requestData.method = this.algorithm;
    requestData.level = this.level ? Number(this.level) : 2;
    requestData.edges = [];
    this.links.forEach(linkData => {
      requestData.edges.push({source: linkData.source.index, target: linkData.target.index});
    });
    return this.graphAlgorithmService.requestCommunityDetection(requestData)
      .then(responseData => {
        this.resultData = responseData;
        if ('yes' === this.showModularity) {
          // 使用girvan_newman算法时，可以拿到模块度变化数据
          this.resultData.forEach(data => {
            this.chartData.push({iteration: data.iteration, modularity: data.modularity});
          });
          this.initChart();
          this.startAnimation();
        } else {
          this.resultData.forEach(node => {
            const nodeData = this.indexToNodeData.get(node.node);
            if (nodeData) {
              if (nodeData.group !== node.community) {
                nodeData.group = node.community;
                this.refreshColor(nodeData);
              }
            }
          });
          this.requestRender();
        }
      });
  }

  /**
   * 初始化力学模拟器
   * @param data 数据
   * @param options 参数
   */
  initForceLayout(data, options: any) {
    this.nodes = new Set<any>(data.nodes);
    this.links = new Set<any>(data.links);

    const iterations = options.iterations;
    const nodeRepulsionStrength = options.nodeRepulsionStrength;

    d3.forceSimulation(data.nodes)
    // 链接力
      .force('link', d3.forceLink(data.links).id(linkData => linkData.id))
      // 万有引力
      .force('charge', d3.forceManyBody().strength(-nodeRepulsionStrength))
      // 向心力
      .force('center', d3.forceCenter())
      .stop()
      .tick(iterations);
  }

  initChart() {
    const selection = d3.select(this.chartDiv.nativeElement);

    const margin = ({top: 20, right: 30, bottom: 30, left: 40});

    this.y = d3.scaleLinear()
      .domain([0, d3.max(this.chartData, d => d.modularity)]).nice()
      .range([this.CHART_SCREEN_HEIGHT - margin.bottom, margin.top]);

    this.x = d3.scaleLinear()
      .domain(d3.extent(this.chartData, d => d.iteration))
      .range([margin.left, this.CHART_SCREEN_WIDTH - margin.right]);

    const line = d3.line()
      .defined(d => !isNaN(d.modularity))
      .x(d => this.x(d.iteration))
      .y(d => this.y(d.modularity));

    const yAxis = g => {
      g.attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(this.y))
        .call(g1 => g1.select('.domain').remove())
        .call(g2 => {
            g2.select('.tick:last-of-type text').clone()
              .attr('x', 3)
              .attr('text-anchor', 'start')
              .attr('font-weight', 'bold')
              .text('modularity');
          }
        );
    };

    const xAxis = g => g
      .attr('transform', `translate(0,${this.CHART_SCREEN_HEIGHT - margin.bottom})`)
      .call(d3.axisBottom(this.x).ticks(this.CHART_SCREEN_WIDTH / 80).tickSizeOuter(0))
      .call(g1 => g1.append('text')
        .attr('x', this.CHART_SCREEN_WIDTH - margin.right)
        .attr('y', -4)
        .attr('fill', '#8a8d93')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'end')
        .text('iteration'));

    this.svg = selection
      .append('svg')
      .attr('viewBox', [0, 0, this.CHART_SCREEN_WIDTH, this.CHART_SCREEN_HEIGHT])
      .style('border', '1px dashed #ccc');

    this.svg.append('g')
      .call(xAxis);

    this.svg.append('g')
      .call(yAxis);

    this.svg.append('path')
      .datum(this.chartData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line);

    this.cur = this.svg.append('circle')
      .classed('c', true)
      .attr('r', 6)
      .attr('fill', 'orangered');
  }

  /**
   * 开始动画
   */
  startAnimation() {
    if (!this.resultData || this.resultData.length === 0) {
      return;
    }
    let i = 0;
    let maxModularity = Number.MIN_VALUE;
    let maxModularityIndex = 0;
    for (i = 0; i < this.resultData.length; i++) {
      if (maxModularity <= this.resultData[i].modularity) {
        maxModularity = this.resultData[i].modularity;
        maxModularityIndex = i;
      }
    }
    i = 0;
    const mainInterval = setInterval(() => {
      if (i <= maxModularityIndex) {
        const retData = this.resultData[i];
        this.cur
          .attr('cx', this.x(i))
          .attr('cy', this.y(this.resultData[i].modularity));
        let linkData = this.indexToLinkData.get(retData.cut.source + '_' + retData.cut.target);
        if (!linkData) {
          linkData = this.indexToLinkData.get(retData.cut.target + '_' + retData.cut.source);
        }
        if (linkData) {
          // this.deleteLink(linkData);
          this.startDeleteLine(linkData);
        }
        retData.communities.forEach(node => {
          const nodeData = this.indexToNodeData.get(node.node);
          if (nodeData) {
            if (nodeData.group !== node.community) {
              nodeData.group = node.community;
              this.refreshColor(nodeData);
            }
          }
        });
        i++;
      } else {
        clearInterval(mainInterval);
      }
      this.requestRender();
    }, 100);
  }

  /**
   * 开始删除边
   * @param linkData 边
   */
  startDeleteLine(linkData) {
    const lineGfx = this.linkDataToLineGfx.get(linkData);
    if (!lineGfx) {
      return;
    }
    if (!this.lineGfxToFilter) {
      this.lineGfxToFilter = new WeakMap();
    }
    let filter: GlowFilter = this.lineGfxToFilter.get(lineGfx);
    if (!filter) {
      // filter = new GlowFilter(15, 2, 1, 0xff9999, 0.5);
      filter = new GlowFilter(1, 1, 1, 0xADD8E6, 0.5);
      lineGfx.filters = [filter];
    }
    let i = 0;
    const interval = setInterval(() => {
      filter.distance = 10 * (Math.sin(i) + 2);
      filter.outerStrength = 2 * (Math.sin(i) + 1);
      filter.innerStrength = Math.sin(i) + 1;
      i += 18;
      if (i > 360) {
        clearInterval(interval);
        this.deleteLink(linkData);
      }
      this.requestRender();
    }, 100);
  }

  /**
   * 获得节点的颜色
   * @param nodeData 节点
   */
  color(nodeData): string {
    return this.colorScale(nodeData.group);
  }

  /**
   * 返回16进制的颜色
   * @param color 颜色
   */
  colorToNumber(color): number {
    return parseInt(color.slice(1), 16);
  }

  /**
   * 根据线条的起点、终点、宽度，计算生成方形区域所需的坐标偏移量
   * @param x1 起点 X
   * @param y1 起点 Y
   * @param x2 终点 X
   * @param y2 终点 Y
   * @param width 区域宽度
   */
  deltaXY(x1, y1, x2, y2, width) {
    const widthDiv2 = width / 2;
    if (x1 === x2) {
      return [widthDiv2, 0];
    } else {
      const tanT = (y2 - y1) / (x2 - x1);
      const sinT = Math.sin(Math.atan(tanT));
      const cosT = Math.sqrt(1 - sinT * sinT);
      return [widthDiv2 * sinT, widthDiv2 * cosT];
    }
  }

  /**
   * 删除边
   * @param linkData 边
   */
  deleteLink(linkData) {
    this.links.delete(linkData);
    const lineGfx = this.linkDataToLineGfx.get(linkData);
    const line = this.linkDataToLine.get(linkData);
    this.linkDataToLineGfx.delete(linkData);
    this.linkDataToLine.delete(linkData);
    this.lineGfxToLinkData.delete(lineGfx);
    this.lineToLinkData.delete(line);
    this.linksLayer.removeChild(lineGfx);
  }

  refreshColor(nodeData) {
    const circle = this.nodeDataToCircle.get(nodeData);
    const color = this.color(nodeData);
    circle.clear();
    circle.beginFill(this.colorToNumber(color));
    circle.drawCircle(circle.x, circle.y, this.NODE_RADIUS);
  }

  /**
   * 渲染画布
   */
  requestRender() {
    if (this.renderRequestId) {
      return;
    }
    this.renderRequestId = window.requestAnimationFrame(() => {
      this.app.render();
      this.renderRequestId = undefined;
    });
  }

  /**
   * 更新画布元素，并请求渲染画布
   */
  update() {
    // 如果1：对于只在一个PIXI.Graphics中绘制线条：
    // this.linksLayer.clear();
    // this.linksLayer.alpha = 0.6;
    // this.links.forEach(linkData => {
    //   this.linksLayer.lineStyle(Math.sqrt(linkData.value), 0x999999);
    //   this.linksLayer.moveTo(linkData.source.x, linkData.source.y);
    //   this.linksLayer.lineTo(linkData.target.x, linkData.target.y);
    // });
    // this.linksLayer.endFill();

    // 如果2：对于每个线条创建一个PIXI.Graphics，并增加事件响应区域：
    this.links.forEach(linkData => {
      const lineWidth = linkData.value ? Math.sqrt(linkData.value) : 1;
      const [deltaX, deltaY] = this.deltaXY(linkData.source.x, linkData.source.y, linkData.target.x, linkData.target.y, lineWidth);
      const lineGfx = this.linkDataToLineGfx.get(linkData);
      lineGfx.hitArea = new PIXI.Polygon([
        new PIXI.Point(linkData.source.x - deltaX, linkData.source.y + deltaY),
        new PIXI.Point(linkData.target.x - deltaX, linkData.target.y + deltaY),
        new PIXI.Point(linkData.target.x + deltaX, linkData.target.y - deltaY),
        new PIXI.Point(linkData.source.x + deltaX, linkData.source.y - deltaY)
      ]);

      const line = this.linkDataToLine.get(linkData);
      line.clear();
      line.alpha = this.LINE_ALPHA;
      line.lineStyle(lineWidth, 0xE0FFFF);
      line.moveTo(linkData.source.x, linkData.source.y);
      line.lineTo(linkData.target.x, linkData.target.y);
      line.endFill();
    });

    this.nodes.forEach(nodeData => {
      const nodeGfx = this.nodeDataToNodeGfx.get(nodeData);
      const labelGfx = this.nodeDataToLabelGfx.get(nodeData);

      nodeGfx.position = new PIXI.Point(nodeData.x, nodeData.y);
      labelGfx.position = new PIXI.Point(nodeData.x, nodeData.y);
    });

    this.requestRender();
  }

  /**
   * 鼠标悬停效果
   * @param nodeData 节点
   */
  hoverNodeStart(nodeData) {
    if (this.clickedNodeData) {
      return;
    }
    if (this.hoveredNodeData === nodeData) {
      return;
    }

    this.hoveredNodeData = nodeData;

    const nodeGfx = this.nodeDataToNodeGfx.get(nodeData);
    const labelGfx = this.nodeDataToLabelGfx.get(nodeData);

    // 移动至顶层
    this.nodesLayer.removeChild(nodeGfx);
    this.frontLayer.addChild(nodeGfx);
    this.labelsLayer.removeChild(labelGfx);
    this.frontLayer.addChild(labelGfx);

    // 鼠标悬停
    this.hoveredNodeGfxOriginalChildren = [...nodeGfx.children];
    this.hoveredLabelGfxOriginalChildren = [...labelGfx.children];

    // 节点圆圈边界
    const circleBorder = new PIXI.Graphics();
    circleBorder.x = 0;
    circleBorder.y = 0;
    circleBorder.lineStyle(1.5, 0x000000);
    circleBorder.drawCircle(0, 0, this.NODE_RADIUS);
    nodeGfx.addChild(circleBorder);

    // 标签 & 背景
    const labelText = new PIXI.Text(this.LABEL_TEXT(nodeData), {
      fontFamily: this.LABEL_FONT_FAMILY,
      fontSize: this.LABEL_FONT_SIZE,
      fill: 0x333333
    });
    labelText.x = 0;
    labelText.y = this.NODE_HIT_RADIUS + this.LABEL_Y_PADDING;
    labelText.anchor.set(0.5, 0);
    const labelBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
    labelBackground.x = -(labelText.width + this.LABEL_X_PADDING * 2) / 2;
    labelBackground.y = this.NODE_HIT_RADIUS;
    labelBackground.width = labelText.width + this.LABEL_X_PADDING * 2;
    labelBackground.height = labelText.height + this.LABEL_Y_PADDING * 2;
    labelBackground.tint = 0xEEEEEE;
    labelGfx.addChild(labelBackground);
    labelGfx.addChild(labelText);

    this.requestRender();
  }

  /**
   * 移除鼠标悬停效果
   * @param nodeData 节点
   */
  hoverNodeEnd(nodeData) {
    if (this.clickedNodeData) {
      return;
    }
    if (this.hoveredNodeData !== nodeData) {
      return;
    }

    this.hoveredNodeData = undefined;

    const nodeGfx = this.nodeDataToNodeGfx.get(nodeData);
    const labelGfx = this.nodeDataToLabelGfx.get(nodeData);

    // move back from front layer
    this.frontLayer.removeChild(nodeGfx);
    this.nodesLayer.addChild(nodeGfx);
    this.frontLayer.removeChild(labelGfx);
    this.labelsLayer.addChild(labelGfx);

    // clear hover effect
    const nodeGfxChildren = [...nodeGfx.children];
    for (const child of nodeGfxChildren) {
      if (!this.hoveredNodeGfxOriginalChildren.includes(child)) {
        nodeGfx.removeChild(child);
      }
    }
    this.hoveredNodeGfxOriginalChildren = undefined;
    const labelGfxChildren = [...labelGfx.children];
    for (const child of labelGfxChildren) {
      if (!this.hoveredLabelGfxOriginalChildren.includes(child)) {
        labelGfx.removeChild(child);
      }
    }
    this.hoveredLabelGfxOriginalChildren = undefined;

    this.requestRender();
  }

  /**
   * 移动节点
   * @param nodeData 节点
   * @param point 位置
   */
  moveNode(nodeData, point) {
    nodeData.x = point.x;
    nodeData.y = point.y;

    this.update();
  }

  /**
   * 鼠标移动
   * @param event 事件
   */
  appMouseMove(event) {
    if (!this.clickedNodeData) {
      return;
    }

    this.moveNode(this.clickedNodeData, this.viewport.toWorld(event.data.global));
  }

  /**
   * 节点点击效果
   * @param nodeData 节点
   */
  clickNodeStart(nodeData) {
    console.log(nodeData);
    this.clickedNodeData = nodeData;
    // 启动节点拖拽
    this.app.renderer.plugins.interaction.on('mousemove', this.appMouseMove, this);
    // 禁用视窗拖拽
    this.viewport.pause = true;
  }

  /**
   * 节点松开点击效果
   */
  clickNodeEnd() {
    this.clickedNodeData = undefined;
    // 禁用节点拖拽
    this.app.renderer.plugins.interaction.off('mousemove', this.appMouseMove, this);
    // 启用视窗拖拽
    this.viewport.pause = false;
  }

  /**
   * 边点击效果
   * @param linkData 边
   */
  clickLineStart(linkData) {
    this.clickedLineData = linkData;
  }

  /**
   * 边松开点击效果
   */
  clickLineEnd() {
    this.clickedLineData = undefined;

    this.update();
  }
}
