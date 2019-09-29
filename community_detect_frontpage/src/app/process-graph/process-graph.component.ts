import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import * as PIXI from 'pixi.js';
import * as d3 from 'd3';
import {Viewport} from 'pixi-viewport';
import {GlowFilter} from 'pixi-filters';
import {ProcessGraphService} from './process-graph.service';
import {CommunityDetectionRequest} from './community-detection-request';

@Component({
  selector: 'app-process-graph',
  templateUrl: './process-graph.component.html',
  styleUrls: ['./process-graph.component.css']
})
export class ProcessGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('graphDivGrivanNewman', {static: true})
  graphDivGrivanNewman: ElementRef;
  @ViewChild('graphDivModularityMaximization', {static: true})
  graphDivModularityMaximization: ElementRef;
  @ViewChild('graphDivSpectrialPartition', {static: true})
  graphDivSpectrialPartition: ElementRef;
  @ViewChild('graphDivLouvain', {static: true})
  graphDivLouvain: ElementRef;
  @ViewChild('graphDivWalktrap', {static: true})
  graphDivWalktrap: ElementRef;
  @ViewChild('graphDivLpa', {static: true})
  graphDivLpa: ElementRef;
  @ViewChild('chartDiv', {static: true})
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
  app = {}; // PIXI.Application;
  viewport = {}; // Viewport;
  nodeContainer = {}; // PIXI.ParticleContainer;
  graphData = {
    nodes: [
      {id: 'Myriel', group: 0},
      {id: 'Napoleon', group: 0},
      {id: 'Mlle.Baptistine', group: 0},
      {id: 'Mme.Magloire', group: 0},
      {id: 'CountessdeLo', group: 0},
      {id: 'Geborand', group: 0},
      {id: 'Champtercier', group: 0},
      {id: 'Cravatte', group: 0},
      {id: 'Count', group: 0},
      {id: 'OldMan', group: 0},
      {id: 'Labarre', group: 0},
      {id: 'Valjean', group: 0},
      {id: 'Marguerite', group: 0},
      {id: 'Mme.deR', group: 0},
      {id: 'Isabeau', group: 0},
      {id: 'Gervais', group: 0},
      {id: 'Tholomyes', group: 0},
      {id: 'Listolier', group: 0},
      {id: 'Fameuil', group: 0},
      {id: 'Blacheville', group: 0},
      {id: 'Favourite', group: 0},
      {id: 'Dahlia', group: 0},
      {id: 'Zephine', group: 0},
      {id: 'Fantine', group: 0},
      {id: 'Mme.Thenardier', group: 0},
      {id: 'Thenardier', group: 0},
      {id: 'Cosette', group: 0},
      {id: 'Javert', group: 0},
      {id: 'Fauchelevent', group: 0},
      {id: 'Bamatabois', group: 0},
      {id: 'Perpetue', group: 0},
      {id: 'Simplice', group: 0},
      {id: 'Scaufflaire', group: 0},
      {id: 'Woman1', group: 0},
      {id: 'Judge', group: 0},
      {id: 'Champmathieu', group: 0},
      {id: 'Brevet', group: 0},
      {id: 'Chenildieu', group: 0},
      {id: 'Cochepaille', group: 0},
      {id: 'Pontmercy', group: 0},
      {id: 'Boulatruelle', group: 0},
      {id: 'Eponine', group: 0},
      {id: 'Anzelma', group: 0},
      {id: 'Woman2', group: 0},
      {id: 'MotherInnocent', group: 0},
      {id: 'Gribier', group: 0},
      {id: 'Jondrette', group: 0},
      {id: 'Mme.Burgon', group: 0},
      {id: 'Gavroche', group: 0},
      {id: 'Gillenormand', group: 0},
      {id: 'Magnon', group: 0},
      {id: 'Mlle.Gillenormand', group: 0},
      {id: 'Mme.Pontmercy', group: 0},
      {id: 'Mlle.Vaubois', group: 0},
      {id: 'Lt.Gillenormand', group: 0},
      {id: 'Marius', group: 0},
      {id: 'BaronessT', group: 0},
      {id: 'Mabeuf', group: 0},
      {id: 'Enjolras', group: 0},
      {id: 'Combeferre', group: 0},
      {id: 'Prouvaire', group: 0},
      {id: 'Feuilly', group: 0},
      {id: 'Courfeyrac', group: 0},
      {id: 'Bahorel', group: 0},
      {id: 'Bossuet', group: 0},
      {id: 'Joly', group: 0},
      {id: 'Grantaire', group: 0},
      {id: 'MotherPlutarch', group: 0},
      {id: 'Gueulemer', group: 0},
      {id: 'Babet', group: 0},
      {id: 'Claquesous', group: 0},
      {id: 'Montparnasse', group: 0},
      {id: 'Toussaint', group: 0},
      {id: 'Child1', group: 0},
      {id: 'Child2', group: 0},
      {id: 'Brujon', group: 0},
      {id: 'Mme.Hucheloup', group: 0}
    ],
    links: [
      {source: 'Napoleon', target: 'Myriel', value: 1},
      {source: 'Mlle.Baptistine', target: 'Myriel', value: 8},
      {source: 'Mme.Magloire', target: 'Myriel', value: 10},
      {source: 'Mme.Magloire', target: 'Mlle.Baptistine', value: 6},
      {source: 'CountessdeLo', target: 'Myriel', value: 1},
      {source: 'Geborand', target: 'Myriel', value: 1},
      {source: 'Champtercier', target: 'Myriel', value: 1},
      {source: 'Cravatte', target: 'Myriel', value: 1},
      {source: 'Count', target: 'Myriel', value: 2},
      {source: 'OldMan', target: 'Myriel', value: 1},
      {source: 'Valjean', target: 'Labarre', value: 1},
      {source: 'Valjean', target: 'Mme.Magloire', value: 3},
      {source: 'Valjean', target: 'Mlle.Baptistine', value: 3},
      {source: 'Valjean', target: 'Myriel', value: 5},
      {source: 'Marguerite', target: 'Valjean', value: 1},
      {source: 'Mme.deR', target: 'Valjean', value: 1},
      {source: 'Isabeau', target: 'Valjean', value: 1},
      {source: 'Gervais', target: 'Valjean', value: 1},
      {source: 'Listolier', target: 'Tholomyes', value: 4},
      {source: 'Fameuil', target: 'Tholomyes', value: 4},
      {source: 'Fameuil', target: 'Listolier', value: 4},
      {source: 'Blacheville', target: 'Tholomyes', value: 4},
      {source: 'Blacheville', target: 'Listolier', value: 4},
      {source: 'Blacheville', target: 'Fameuil', value: 4},
      {source: 'Favourite', target: 'Tholomyes', value: 3},
      {source: 'Favourite', target: 'Listolier', value: 3},
      {source: 'Favourite', target: 'Fameuil', value: 3},
      {source: 'Favourite', target: 'Blacheville', value: 4},
      {source: 'Dahlia', target: 'Tholomyes', value: 3},
      {source: 'Dahlia', target: 'Listolier', value: 3},
      {source: 'Dahlia', target: 'Fameuil', value: 3},
      {source: 'Dahlia', target: 'Blacheville', value: 3},
      {source: 'Dahlia', target: 'Favourite', value: 5},
      {source: 'Zephine', target: 'Tholomyes', value: 3},
      {source: 'Zephine', target: 'Listolier', value: 3},
      {source: 'Zephine', target: 'Fameuil', value: 3},
      {source: 'Zephine', target: 'Blacheville', value: 3},
      {source: 'Zephine', target: 'Favourite', value: 4},
      {source: 'Zephine', target: 'Dahlia', value: 4},
      {source: 'Fantine', target: 'Tholomyes', value: 3},
      {source: 'Fantine', target: 'Listolier', value: 3},
      {source: 'Fantine', target: 'Fameuil', value: 3},
      {source: 'Fantine', target: 'Blacheville', value: 3},
      {source: 'Fantine', target: 'Favourite', value: 4},
      {source: 'Fantine', target: 'Dahlia', value: 4},
      {source: 'Fantine', target: 'Zephine', value: 4},
      {source: 'Fantine', target: 'Marguerite', value: 2},
      {source: 'Fantine', target: 'Valjean', value: 9},
      {source: 'Mme.Thenardier', target: 'Fantine', value: 2},
      {source: 'Mme.Thenardier', target: 'Valjean', value: 7},
      {source: 'Thenardier', target: 'Mme.Thenardier', value: 13},
      {source: 'Thenardier', target: 'Fantine', value: 1},
      {source: 'Thenardier', target: 'Valjean', value: 12},
      {source: 'Cosette', target: 'Mme.Thenardier', value: 4},
      {source: 'Cosette', target: 'Valjean', value: 31},
      {source: 'Cosette', target: 'Tholomyes', value: 1},
      {source: 'Cosette', target: 'Thenardier', value: 1},
      {source: 'Javert', target: 'Valjean', value: 17},
      {source: 'Javert', target: 'Fantine', value: 5},
      {source: 'Javert', target: 'Thenardier', value: 5},
      {source: 'Javert', target: 'Mme.Thenardier', value: 1},
      {source: 'Javert', target: 'Cosette', value: 1},
      {source: 'Fauchelevent', target: 'Valjean', value: 8},
      {source: 'Fauchelevent', target: 'Javert', value: 1},
      {source: 'Bamatabois', target: 'Fantine', value: 1},
      {source: 'Bamatabois', target: 'Javert', value: 1},
      {source: 'Bamatabois', target: 'Valjean', value: 2},
      {source: 'Perpetue', target: 'Fantine', value: 1},
      {source: 'Simplice', target: 'Perpetue', value: 2},
      {source: 'Simplice', target: 'Valjean', value: 3},
      {source: 'Simplice', target: 'Fantine', value: 2},
      {source: 'Simplice', target: 'Javert', value: 1},
      {source: 'Scaufflaire', target: 'Valjean', value: 1},
      {source: 'Woman1', target: 'Valjean', value: 2},
      {source: 'Woman1', target: 'Javert', value: 1},
      {source: 'Judge', target: 'Valjean', value: 3},
      {source: 'Judge', target: 'Bamatabois', value: 2},
      {source: 'Champmathieu', target: 'Valjean', value: 3},
      {source: 'Champmathieu', target: 'Judge', value: 3},
      {source: 'Champmathieu', target: 'Bamatabois', value: 2},
      {source: 'Brevet', target: 'Judge', value: 2},
      {source: 'Brevet', target: 'Champmathieu', value: 2},
      {source: 'Brevet', target: 'Valjean', value: 2},
      {source: 'Brevet', target: 'Bamatabois', value: 1},
      {source: 'Chenildieu', target: 'Judge', value: 2},
      {source: 'Chenildieu', target: 'Champmathieu', value: 2},
      {source: 'Chenildieu', target: 'Brevet', value: 2},
      {source: 'Chenildieu', target: 'Valjean', value: 2},
      {source: 'Chenildieu', target: 'Bamatabois', value: 1},
      {source: 'Cochepaille', target: 'Judge', value: 2},
      {source: 'Cochepaille', target: 'Champmathieu', value: 2},
      {source: 'Cochepaille', target: 'Brevet', value: 2},
      {source: 'Cochepaille', target: 'Chenildieu', value: 2},
      {source: 'Cochepaille', target: 'Valjean', value: 2},
      {source: 'Cochepaille', target: 'Bamatabois', value: 1},
      {source: 'Pontmercy', target: 'Thenardier', value: 1},
      {source: 'Boulatruelle', target: 'Thenardier', value: 1},
      {source: 'Eponine', target: 'Mme.Thenardier', value: 2},
      {source: 'Eponine', target: 'Thenardier', value: 3},
      {source: 'Anzelma', target: 'Eponine', value: 2},
      {source: 'Anzelma', target: 'Thenardier', value: 2},
      {source: 'Anzelma', target: 'Mme.Thenardier', value: 1},
      {source: 'Woman2', target: 'Valjean', value: 3},
      {source: 'Woman2', target: 'Cosette', value: 1},
      {source: 'Woman2', target: 'Javert', value: 1},
      {source: 'MotherInnocent', target: 'Fauchelevent', value: 3},
      {source: 'MotherInnocent', target: 'Valjean', value: 1},
      {source: 'Gribier', target: 'Fauchelevent', value: 2},
      {source: 'Mme.Burgon', target: 'Jondrette', value: 1},
      {source: 'Gavroche', target: 'Mme.Burgon', value: 2},
      {source: 'Gavroche', target: 'Thenardier', value: 1},
      {source: 'Gavroche', target: 'Javert', value: 1},
      {source: 'Gavroche', target: 'Valjean', value: 1},
      {source: 'Gillenormand', target: 'Cosette', value: 3},
      {source: 'Gillenormand', target: 'Valjean', value: 2},
      {source: 'Magnon', target: 'Gillenormand', value: 1},
      {source: 'Magnon', target: 'Mme.Thenardier', value: 1},
      {source: 'Mlle.Gillenormand', target: 'Gillenormand', value: 9},
      {source: 'Mlle.Gillenormand', target: 'Cosette', value: 2},
      {source: 'Mlle.Gillenormand', target: 'Valjean', value: 2},
      {source: 'Mme.Pontmercy', target: 'Mlle.Gillenormand', value: 1},
      {source: 'Mme.Pontmercy', target: 'Pontmercy', value: 1},
      {source: 'Mlle.Vaubois', target: 'Mlle.Gillenormand', value: 1},
      {source: 'Lt.Gillenormand', target: 'Mlle.Gillenormand', value: 2},
      {source: 'Lt.Gillenormand', target: 'Gillenormand', value: 1},
      {source: 'Lt.Gillenormand', target: 'Cosette', value: 1},
      {source: 'Marius', target: 'Mlle.Gillenormand', value: 6},
      {source: 'Marius', target: 'Gillenormand', value: 12},
      {source: 'Marius', target: 'Pontmercy', value: 1},
      {source: 'Marius', target: 'Lt.Gillenormand', value: 1},
      {source: 'Marius', target: 'Cosette', value: 21},
      {source: 'Marius', target: 'Valjean', value: 19},
      {source: 'Marius', target: 'Tholomyes', value: 1},
      {source: 'Marius', target: 'Thenardier', value: 2},
      {source: 'Marius', target: 'Eponine', value: 5},
      {source: 'Marius', target: 'Gavroche', value: 4},
      {source: 'BaronessT', target: 'Gillenormand', value: 1},
      {source: 'BaronessT', target: 'Marius', value: 1},
      {source: 'Mabeuf', target: 'Marius', value: 1},
      {source: 'Mabeuf', target: 'Eponine', value: 1},
      {source: 'Mabeuf', target: 'Gavroche', value: 1},
      {source: 'Enjolras', target: 'Marius', value: 7},
      {source: 'Enjolras', target: 'Gavroche', value: 7},
      {source: 'Enjolras', target: 'Javert', value: 6},
      {source: 'Enjolras', target: 'Mabeuf', value: 1},
      {source: 'Enjolras', target: 'Valjean', value: 4},
      {source: 'Combeferre', target: 'Enjolras', value: 15},
      {source: 'Combeferre', target: 'Marius', value: 5},
      {source: 'Combeferre', target: 'Gavroche', value: 6},
      {source: 'Combeferre', target: 'Mabeuf', value: 2},
      {source: 'Prouvaire', target: 'Gavroche', value: 1},
      {source: 'Prouvaire', target: 'Enjolras', value: 4},
      {source: 'Prouvaire', target: 'Combeferre', value: 2},
      {source: 'Feuilly', target: 'Gavroche', value: 2},
      {source: 'Feuilly', target: 'Enjolras', value: 6},
      {source: 'Feuilly', target: 'Prouvaire', value: 2},
      {source: 'Feuilly', target: 'Combeferre', value: 5},
      {source: 'Feuilly', target: 'Mabeuf', value: 1},
      {source: 'Feuilly', target: 'Marius', value: 1},
      {source: 'Courfeyrac', target: 'Marius', value: 9},
      {source: 'Courfeyrac', target: 'Enjolras', value: 17},
      {source: 'Courfeyrac', target: 'Combeferre', value: 13},
      {source: 'Courfeyrac', target: 'Gavroche', value: 7},
      {source: 'Courfeyrac', target: 'Mabeuf', value: 2},
      {source: 'Courfeyrac', target: 'Eponine', value: 1},
      {source: 'Courfeyrac', target: 'Feuilly', value: 6},
      {source: 'Courfeyrac', target: 'Prouvaire', value: 3},
      {source: 'Bahorel', target: 'Combeferre', value: 5},
      {source: 'Bahorel', target: 'Gavroche', value: 5},
      {source: 'Bahorel', target: 'Courfeyrac', value: 6},
      {source: 'Bahorel', target: 'Mabeuf', value: 2},
      {source: 'Bahorel', target: 'Enjolras', value: 4},
      {source: 'Bahorel', target: 'Feuilly', value: 3},
      {source: 'Bahorel', target: 'Prouvaire', value: 2},
      {source: 'Bahorel', target: 'Marius', value: 1},
      {source: 'Bossuet', target: 'Marius', value: 5},
      {source: 'Bossuet', target: 'Courfeyrac', value: 12},
      {source: 'Bossuet', target: 'Gavroche', value: 5},
      {source: 'Bossuet', target: 'Bahorel', value: 4},
      {source: 'Bossuet', target: 'Enjolras', value: 10},
      {source: 'Bossuet', target: 'Feuilly', value: 6},
      {source: 'Bossuet', target: 'Prouvaire', value: 2},
      {source: 'Bossuet', target: 'Combeferre', value: 9},
      {source: 'Bossuet', target: 'Mabeuf', value: 1},
      {source: 'Bossuet', target: 'Valjean', value: 1},
      {source: 'Joly', target: 'Bahorel', value: 5},
      {source: 'Joly', target: 'Bossuet', value: 7},
      {source: 'Joly', target: 'Gavroche', value: 3},
      {source: 'Joly', target: 'Courfeyrac', value: 5},
      {source: 'Joly', target: 'Enjolras', value: 5},
      {source: 'Joly', target: 'Feuilly', value: 5},
      {source: 'Joly', target: 'Prouvaire', value: 2},
      {source: 'Joly', target: 'Combeferre', value: 5},
      {source: 'Joly', target: 'Mabeuf', value: 1},
      {source: 'Joly', target: 'Marius', value: 2},
      {source: 'Grantaire', target: 'Bossuet', value: 3},
      {source: 'Grantaire', target: 'Enjolras', value: 3},
      {source: 'Grantaire', target: 'Combeferre', value: 1},
      {source: 'Grantaire', target: 'Courfeyrac', value: 2},
      {source: 'Grantaire', target: 'Joly', value: 2},
      {source: 'Grantaire', target: 'Gavroche', value: 1},
      {source: 'Grantaire', target: 'Bahorel', value: 1},
      {source: 'Grantaire', target: 'Feuilly', value: 1},
      {source: 'Grantaire', target: 'Prouvaire', value: 1},
      {source: 'MotherPlutarch', target: 'Mabeuf', value: 3},
      {source: 'Gueulemer', target: 'Thenardier', value: 5},
      {source: 'Gueulemer', target: 'Valjean', value: 1},
      {source: 'Gueulemer', target: 'Mme.Thenardier', value: 1},
      {source: 'Gueulemer', target: 'Javert', value: 1},
      {source: 'Gueulemer', target: 'Gavroche', value: 1},
      {source: 'Gueulemer', target: 'Eponine', value: 1},
      {source: 'Babet', target: 'Thenardier', value: 6},
      {source: 'Babet', target: 'Gueulemer', value: 6},
      {source: 'Babet', target: 'Valjean', value: 1},
      {source: 'Babet', target: 'Mme.Thenardier', value: 1},
      {source: 'Babet', target: 'Javert', value: 2},
      {source: 'Babet', target: 'Gavroche', value: 1},
      {source: 'Babet', target: 'Eponine', value: 1},
      {source: 'Claquesous', target: 'Thenardier', value: 4},
      {source: 'Claquesous', target: 'Babet', value: 4},
      {source: 'Claquesous', target: 'Gueulemer', value: 4},
      {source: 'Claquesous', target: 'Valjean', value: 1},
      {source: 'Claquesous', target: 'Mme.Thenardier', value: 1},
      {source: 'Claquesous', target: 'Javert', value: 1},
      {source: 'Claquesous', target: 'Eponine', value: 1},
      {source: 'Claquesous', target: 'Enjolras', value: 1},
      {source: 'Montparnasse', target: 'Javert', value: 1},
      {source: 'Montparnasse', target: 'Babet', value: 2},
      {source: 'Montparnasse', target: 'Gueulemer', value: 2},
      {source: 'Montparnasse', target: 'Claquesous', value: 2},
      {source: 'Montparnasse', target: 'Valjean', value: 1},
      {source: 'Montparnasse', target: 'Gavroche', value: 1},
      {source: 'Montparnasse', target: 'Eponine', value: 1},
      {source: 'Montparnasse', target: 'Thenardier', value: 1},
      {source: 'Toussaint', target: 'Cosette', value: 2},
      {source: 'Toussaint', target: 'Javert', value: 1},
      {source: 'Toussaint', target: 'Valjean', value: 1},
      {source: 'Child1', target: 'Gavroche', value: 2},
      {source: 'Child2', target: 'Gavroche', value: 2},
      {source: 'Child2', target: 'Child1', value: 3},
      {source: 'Brujon', target: 'Babet', value: 3},
      {source: 'Brujon', target: 'Gueulemer', value: 3},
      {source: 'Brujon', target: 'Thenardier', value: 3},
      {source: 'Brujon', target: 'Gavroche', value: 1},
      {source: 'Brujon', target: 'Eponine', value: 1},
      {source: 'Brujon', target: 'Claquesous', value: 1},
      {source: 'Brujon', target: 'Montparnasse', value: 1},
      {source: 'Mme.Hucheloup', target: 'Bossuet', value: 1},
      {source: 'Mme.Hucheloup', target: 'Joly', value: 1},
      {source: 'Mme.Hucheloup', target: 'Grantaire', value: 1},
      {source: 'Mme.Hucheloup', target: 'Bahorel', value: 1},
      {source: 'Mme.Hucheloup', target: 'Courfeyrac', value: 1},
      {source: 'Mme.Hucheloup', target: 'Gavroche', value: 1},
      {source: 'Mme.Hucheloup', target: 'Enjolras', value: 1}
    ]
  };
  nodes = {}; // Set<any>;
  links = {}; // Set<any>;
  renderRequestId = {};
  colorScale = d3.scaleOrdinal(d3.schemeTableau10);
  // linksLayer = new PIXI.Graphics();
  linksLayer = {}; // new PIXI.Container();

  // 显示: links, nodes, labels, front
  nodesLayer = {}; // new PIXI.Container();
  labelsLayer = {}; // new PIXI.Container();
  frontLayer = {}; // new PIXI.Container();
  // 状态
  nodeDataToNodeGfx = {}; // new WeakMap();
  nodeGfxToNodeData = {}; // new WeakMap();
  nodeDataToLabelGfx = {}; // new WeakMap();
  labelGfxToNodeData = {}; // new WeakMap();
  nodeDataToCircle = {}; // new WeakMap();
  circleToNodeData = {}; // new WeakMap();
  indexToNodeData = {}; // new Map();
  linkDataToLineGfx = {}; // new WeakMap();
  lineGfxToLinkData = {}; // new WeakMap();
  lineGfxToFilter = {}; // new WeakMap();
  linkDataToLine = {}; // new WeakMap();
  lineToLinkData = {}; // new WeakMap();
  indexToLinkData = {}; // new Map();
  hoveredNodeData = {};
  hoveredNodeGfxOriginalChildren = {};
  hoveredLabelGfxOriginalChildren = {};
  clickedAlgorithm;
  clickedNodeData = {};
  clickedLineData = {};

  resultData = {}; // [];

  chartData = [
    {iteration: 1, modularity: -2.2134193212463565e-17},
    {iteration: 100, modularity: 1},
  ];
  CHART_SCREEN_WIDTH = 800; // 默认值，会在initConfig()函数中被修改
  CHART_SCREEN_HEIGHT = 600; // 默认值，会在initConfig()函数中被修改

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              public processGraphService: ProcessGraphService
  ) {
    if (!PIXI.utils.isWebGLSupported()) {
      this.TYPE = 'canvas';
    }

    PIXI.utils.sayHello(this.TYPE);
  }

  LABEL_TEXT = nodeData => nodeData.id;

  ngOnInit() {
  }

  ngAfterViewInit() {
    // this.renderer.setStyle(this.graphDivGrivanNewman.nativeElement, 'background-color', '#2d3035');

    this.initConfig();
    // 'girvan_newman' | 'modularity_max_maximization' | 'spectral_partition' | 'louvain' | 'walktrap' | 'lpa'
    this.initGraphics('girvan_newman', this.graphDivGrivanNewman.nativeElement);
    this.initData('girvan_newman');
    this.initGraphics('modularity_maximization', this.graphDivModularityMaximization.nativeElement);
    this.initData('modularity_maximization');
    this.initGraphics('spectral_partition', this.graphDivSpectrialPartition.nativeElement);
    this.initData('spectral_partition', 3);
    this.initGraphics('louvain', this.graphDivLouvain.nativeElement);
    this.initData('louvain');
    this.initGraphics('walktrap', this.graphDivWalktrap.nativeElement);
    this.initData('walktrap');
    this.initGraphics('lpa', this.graphDivLpa.nativeElement);
    this.initData('lpa');
  }

  initConfig() {
    this.CHART_SCREEN_WIDTH = this.chartDiv.nativeElement.offsetWidth;
    this.CHART_SCREEN_HEIGHT = this.chartDiv.nativeElement.offsetHeight;
  }

  /**
   * 初始化图表
   */
  initGraphics(algorithm, nativeElement) {
    const GRAPH_SCREEN_WIDTH = nativeElement.offsetWidth;
    const GRAPH_SCREEN_HEIGHT = nativeElement.offsetHeight;
    const GRAPH_WORLD_WIDTH = GRAPH_SCREEN_WIDTH * 2;
    const GRAPH_WORLD_HEIGHT = GRAPH_SCREEN_WIDTH * 2;

    this.app[algorithm] = new PIXI.Application({
      width: GRAPH_SCREEN_WIDTH,
      height: GRAPH_SCREEN_HEIGHT,
      resolution: this.RESOLUTION,
      transparent: true,
      antialias: true,
      autoStart: false, // 不通过ticker进行绘制，仅在需要时手动进行绘制
      forceCanvas: false,
      // resizeTo: this.graphDivGrivanNewman.nativeElement
    });

    // TODO
    this.renderer.appendChild(nativeElement, this.app[algorithm].view);

    // 修改画布颜色、大小
    // this.app.renderer.backgroundColor = 0xFFFFFF;
    // this.app.renderer.resize(512, 512);

    // 让画布占据整个窗口
    // this.app.renderer.view.style.position = 'absolute';
    // this.app.renderer.view.style.display = 'block';
    // this.app.renderer.resize(window.innerWidth, window.innerHeight);

    this.nodeContainer[algorithm] = new PIXI.ParticleContainer();
    this.app[algorithm].stage.addChild(this.nodeContainer[algorithm]);

    this.initForceLayout(algorithm, this.graphData, {
      iterations: this.FORCE_LAYOUT_ITERATIONS,
      nodeRepulsionStrength: this.FORCE_LAYOUT_NODE_REPULSION_STRENGTH,
    });
    this.nodes[algorithm].forEach(nodeData => {
      nodeData.x += GRAPH_WORLD_WIDTH / 2;
      nodeData.y += GRAPH_WORLD_HEIGHT / 2;
    });

    this.viewport[algorithm] = new Viewport({
      screenWidth: GRAPH_SCREEN_WIDTH,
      screenHeight: GRAPH_SCREEN_HEIGHT,
      worldWidth: GRAPH_WORLD_WIDTH,
      worldHeight: GRAPH_WORLD_HEIGHT,
      interaction: this.app[algorithm].renderer.plugins.interaction
    });
    const zoomIn = () => {
      this.viewport[algorithm].zoom(-GRAPH_WORLD_WIDTH / 10, true);
    };
    const zoomOut = () => {
      this.viewport[algorithm].zoom(GRAPH_WORLD_WIDTH / 10, true);
    };
    const resetViewport = () => {
      this.viewport[algorithm].center = new PIXI.Point(GRAPH_WORLD_WIDTH / 2, GRAPH_WORLD_HEIGHT / 2);
      this.viewport[algorithm].setZoom(0.5, true);
    };
    this.app[algorithm].stage.addChild(this.viewport[algorithm]);
    this.viewport[algorithm]
      .drag()
      .pinch()
      .wheel()
      .decelerate();
    // Viewport 框架中主动声明的事件类型中并没有 frame-end
    // @ts-ignore
    this.viewport[algorithm].on('frame-end', () => {
      if (this.viewport[algorithm].dirty) {
        this.requestRender(algorithm);
        this.viewport[algorithm].dirty = false;
      }
    });

    this.linksLayer[algorithm] = new PIXI.Container();
    this.nodesLayer[algorithm] = new PIXI.Container();
    this.labelsLayer[algorithm] = new PIXI.Container();
    this.frontLayer[algorithm] = new PIXI.Container();

    this.viewport[algorithm].addChild(this.linksLayer[algorithm]);
    this.viewport[algorithm].addChild(this.nodesLayer[algorithm]);
    this.viewport[algorithm].addChild(this.labelsLayer[algorithm]);
    this.viewport[algorithm].addChild(this.frontLayer[algorithm]);

    // 绘制节点
    const nodeDataGfxPairs = [];
    this.nodes[algorithm].forEach((nodeData) => {
      const nodeGfx = new PIXI.Container();
      nodeGfx.x = nodeData.x;
      nodeGfx.y = nodeData.y;
      nodeGfx.interactive = true;
      nodeGfx.buttonMode = true;
      nodeGfx.hitArea = new PIXI.Circle(0, 0, this.NODE_HIT_RADIUS);
      nodeGfx.on('mouseover', event => this.hoverNodeStart(algorithm, this.nodeGfxToNodeData[algorithm].get(event.currentTarget)));
      nodeGfx.on('mouseout', event => this.hoverNodeEnd(algorithm, this.nodeGfxToNodeData[algorithm].get(event.currentTarget)));
      nodeGfx.on('mousedown', event => this.clickNodeStart(algorithm, this.nodeGfxToNodeData[algorithm].get(event.currentTarget)));
      nodeGfx.on('mouseup', () => this.clickNodeEnd(algorithm));
      nodeGfx.on('mouseupoutside', () => this.clickNodeEnd(algorithm));

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
      labelGfx.on('mouseover', event => this.hoverNodeStart(algorithm, this.labelGfxToNodeData[algorithm].get(event.currentTarget)));
      labelGfx.on('mouseout', event => this.hoverNodeEnd(algorithm, this.labelGfxToNodeData[algorithm].get(event.currentTarget)));
      labelGfx.on('mousedown', event => this.clickNodeStart(algorithm, this.labelGfxToNodeData[algorithm].get(event.currentTarget)));
      labelGfx.on('mouseup', () => this.clickNodeEnd(algorithm));
      labelGfx.on('mouseupoutside', () => this.clickNodeEnd(algorithm));

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

      this.nodesLayer[algorithm].addChild(nodeGfx);
      this.labelsLayer[algorithm].addChild(labelGfx);

      nodeDataGfxPairs.push([nodeData, nodeGfx, labelGfx, circle]);
    });

    // 绘制边
    const linkDataGfxPairs = [];
    this.links[algorithm].forEach(linkData => {
      const lineWidth = Math.sqrt(linkData.value);
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
      lineGfx.on('mousedown', event => this.clickLineStart(algorithm, this.lineGfxToLinkData[algorithm].get(event.currentTarget)));
      lineGfx.on('mouseup', () => this.clickLineEnd(algorithm));
      lineGfx.on('mouseupoutside', () => this.clickLineEnd(algorithm));

      const line = new PIXI.Graphics();
      line.alpha = this.LINE_ALPHA;
      line.lineStyle(lineWidth, 0x999999);
      line.moveTo(linkData.source.x, linkData.source.y);
      line.lineTo(linkData.target.x, linkData.target.y);
      lineGfx.addChild(line);
      this.linksLayer[algorithm].addChild(lineGfx);
      linkDataGfxPairs.push([linkData, lineGfx, line, linkData.source.index.toString() + '_' + linkData.target.index.toString()]);
    });

    // 索引
    this.nodeDataToNodeGfx[algorithm] = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [nodeData, nodeGfx]));
    this.nodeGfxToNodeData[algorithm] = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [nodeGfx, nodeData]));
    this.nodeDataToLabelGfx[algorithm] = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [nodeData, labelGfx]));
    this.labelGfxToNodeData[algorithm] = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [labelGfx, nodeData]));
    this.nodeDataToCircle[algorithm] = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [nodeData, circle]));
    this.circleToNodeData[algorithm] = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [circle, nodeData]));
    this.indexToNodeData[algorithm] = new Map(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx, circle]) => [nodeData.index, nodeData]));

    this.linkDataToLineGfx[algorithm] = new WeakMap(linkDataGfxPairs.map(([linkData, lineGfx, line]) => [linkData, lineGfx]));
    this.lineGfxToLinkData[algorithm] = new WeakMap(linkDataGfxPairs.map(([linkData, lineGfx, line]) => [lineGfx, linkData]));
    this.linkDataToLine[algorithm] = new WeakMap(linkDataGfxPairs.map(([linkData, lineGfx, line]) => [linkData, line]));
    this.lineToLinkData[algorithm] = new WeakMap(linkDataGfxPairs.map(([linkData, lineGfx, line]) => [line, linkData]));
    this.indexToLinkData[algorithm] = new Map(
      linkDataGfxPairs.map(([linkData, lineGfx, line, key]) => [key, linkData]));

    // 初始化可视区域
    resetViewport();
    this.update(algorithm);

    // 阻止默认鼠标滚动行为
    this.app[algorithm].view.addEventListener('wheel', event => {
      event.preventDefault();
    });
  }

  /**
   * 请求社群发现的数据
   */
  initData(algorithm, level?: number): Promise<any> {
    this.chartData = [];
    const requestData = new CommunityDetectionRequest();
    requestData.num_nodes = this.nodes[algorithm].size;
    requestData.method = algorithm;
    if (level) {
      requestData.level = level;
    } else {
      requestData.level = 2;
    }
    requestData.edges = [];
    this.links[algorithm].forEach(linkData => {
      requestData.edges.push({source: linkData.source.index, target: linkData.target.index});
    });
    return this.processGraphService.requestCommunityDetection(requestData)
      .then(responseData => {
        this.resultData[algorithm] = responseData;
        if (algorithm === 'girvan_newman') {
          this.resultData[algorithm].forEach(data => {
            this.chartData.push({iteration: data.iteration, modularity: data.modularity});
          });
          this.initChart();
          this.startAnimation(algorithm);
        } else {
          this.resultData[algorithm].forEach(node => {
            const nodeData = this.indexToNodeData[algorithm].get(node.node);
            if (nodeData) {
              if (nodeData.group !== node.community) {
                nodeData.group = node.community;
                this.refreshColor(algorithm, nodeData);
              }
            }
          });
          this.requestRender(algorithm);
        }
      });
  }

  /**
   * 初始化力学模拟器
   * @param data 数据
   * @param options 参数
   */
  initForceLayout(algorithm, data, options: any) {
    this.nodes[algorithm] = new Set<any>(data.nodes);
    this.links[algorithm] = new Set<any>(data.links);

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
              .text('模块度');
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
        .text('迭代次数'));

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

  startAnimation(algorithm) {
    if (!this.resultData[algorithm] || this.resultData[algorithm].length === 0) {
      return;
    }
    let i = 0;
    let maxModularity = Number.MIN_VALUE;
    let maxModularityIndex = 0;
    for (i = 0; i < this.resultData[algorithm].length; i++) {
      if (maxModularity < this.resultData[algorithm][i].modularity) {
        maxModularity = this.resultData[algorithm][i].modularity;
        maxModularityIndex = i;
      }
    }
    i = 0;
    const mainInterval = setInterval(() => {
      if (i <= maxModularityIndex) {
        const retData = this.resultData[algorithm][i];
        this.cur
          .attr('cx', this.x(i))
          .attr('cy', this.y(this.resultData[algorithm][i].modularity));
        let linkData = this.indexToLinkData[algorithm].get(retData.cut.source + '_' + retData.cut.target);
        if (!linkData) {
          linkData = this.indexToLinkData[algorithm].get(retData.cut.target + '_' + retData.cut.source);
        }
        if (linkData) {
          // this.deleteLink(linkData);
          this.startDeleteLine(algorithm, linkData);
        }
        retData.communities.forEach(node => {
          const nodeData = this.indexToNodeData[algorithm].get(node.node);
          if (nodeData) {
            if (nodeData.group !== node.community) {
              nodeData.group = node.community;
              this.refreshColor(algorithm, nodeData);
            }
          }
        });
        i++;
      } else {
        clearInterval(mainInterval);
      }
      this.requestRender(algorithm);
    }, 100);
  }

  startDeleteLine(algorithm, linkData) {
    const lineGfx = this.linkDataToLineGfx[algorithm].get(linkData);
    if (!lineGfx) {
      return;
    }
    if (!this.lineGfxToFilter[algorithm]) {
      this.lineGfxToFilter[algorithm] = new WeakMap();
    }
    let filter: GlowFilter = this.lineGfxToFilter[algorithm].get(lineGfx);
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
        this.deleteLink(algorithm, linkData);
      }
      this.requestRender(algorithm);
    }, 100);
  }

  // addCircle(i,delay){
  //   .append("circle")
  //     .classed("c",true)
  //     .attr("r",6)
  //     .attr("fill","orangered")
  //     .attr("transform","translate("+points.source.x+","+points.source.y+")");
  //   circle.transition()
  //     .ease("in")
  //     .delay(delay||0)
  //     .duration(Math.random()*500+1000)
  //     .attrTween("transform",function(d,i,a){
  //       var l = path.getTotalLength();
  //       return function(t){
  //         var p = path.getPointAtLength(t * l)
  //         return "translate("+ p.x+","+ p.y+")"
  //       }
  //     })
  //     .each("end",function(){
  //       d3.select(this).remove();
  //       addCircle(i,Math.random()*500);
  //     });
  //
  // }


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
  deleteLink(algorithm, linkData) {
    this.links[algorithm].delete(linkData);
    const lineGfx = this.linkDataToLineGfx[algorithm].get(linkData);
    const line = this.linkDataToLine[algorithm].get(linkData);
    this.linkDataToLineGfx[algorithm].delete(linkData);
    this.linkDataToLine[algorithm].delete(linkData);
    this.lineGfxToLinkData[algorithm].delete(lineGfx);
    this.lineToLinkData[algorithm].delete(line);
    this.linksLayer[algorithm].removeChild(lineGfx);
  }

  refreshColor(algorithm, nodeData) {
    const circle = this.nodeDataToCircle[algorithm].get(nodeData);
    circle.clear();
    const color = this.color(nodeData);
    circle.beginFill(this.colorToNumber(color));
    circle.drawCircle(circle.x, circle.y, this.NODE_RADIUS);
  }

  /**
   * 渲染画布
   */
  requestRender(algorithm) {
    if (this.renderRequestId[algorithm]) {
      return;
    }
    this.renderRequestId[algorithm] = window.requestAnimationFrame(() => {
      this.app[algorithm].render();
      this.renderRequestId[algorithm] = undefined;
    });
  }

  /**
   * 更新画布元素，并请求渲染画布
   */
  update(algorithm) {
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
    this.links[algorithm].forEach(linkData => {
      const lineWidth = Math.sqrt(linkData.value);
      const [deltaX, deltaY] = this.deltaXY(linkData.source.x, linkData.source.y, linkData.target.x, linkData.target.y, lineWidth);
      const lineGfx = this.linkDataToLineGfx[algorithm].get(linkData);
      lineGfx.hitArea = new PIXI.Polygon([
        new PIXI.Point(linkData.source.x - deltaX, linkData.source.y + deltaY),
        new PIXI.Point(linkData.target.x - deltaX, linkData.target.y + deltaY),
        new PIXI.Point(linkData.target.x + deltaX, linkData.target.y - deltaY),
        new PIXI.Point(linkData.source.x + deltaX, linkData.source.y - deltaY)
      ]);

      const line = this.linkDataToLine[algorithm].get(linkData);
      line.clear();
      line.alpha = this.LINE_ALPHA;
      line.lineStyle(lineWidth, 0x999999);
      line.moveTo(linkData.source.x, linkData.source.y);
      line.lineTo(linkData.target.x, linkData.target.y);
      line.endFill();
    });

    this.nodes[algorithm].forEach(nodeData => {
      const nodeGfx = this.nodeDataToNodeGfx[algorithm].get(nodeData);
      const labelGfx = this.nodeDataToLabelGfx[algorithm].get(nodeData);

      nodeGfx.position = new PIXI.Point(nodeData.x, nodeData.y);
      labelGfx.position = new PIXI.Point(nodeData.x, nodeData.y);
    });

    this.requestRender(algorithm);
  }

  /**
   * 鼠标悬停效果
   * @param nodeData 节点
   */
  hoverNodeStart(algorithm, nodeData) {
    if (this.clickedNodeData[algorithm]) {
      return;
    }
    if (this.hoveredNodeData[algorithm] === nodeData) {
      return;
    }

    this.hoveredNodeData[algorithm] = nodeData;

    const nodeGfx = this.nodeDataToNodeGfx[algorithm].get(nodeData);
    const labelGfx = this.nodeDataToLabelGfx[algorithm].get(nodeData);

    // 移动至顶层
    this.nodesLayer[algorithm].removeChild(nodeGfx);
    this.frontLayer[algorithm].addChild(nodeGfx);
    this.labelsLayer[algorithm].removeChild(labelGfx);
    this.frontLayer[algorithm].addChild(labelGfx);

    // 鼠标悬停
    this.hoveredNodeGfxOriginalChildren[algorithm] = [...nodeGfx.children];
    this.hoveredLabelGfxOriginalChildren[algorithm] = [...labelGfx.children];

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

    this.requestRender(algorithm);
  }

  /**
   * 移除鼠标悬停效果
   * @param nodeData 节点
   */
  hoverNodeEnd(algorithm, nodeData) {
    if (this.clickedNodeData[algorithm]) {
      return;
    }
    if (this.hoveredNodeData[algorithm] !== nodeData) {
      return;
    }

    this.hoveredNodeData[algorithm] = undefined;

    const nodeGfx = this.nodeDataToNodeGfx[algorithm].get(nodeData);
    const labelGfx = this.nodeDataToLabelGfx[algorithm].get(nodeData);

    // move back from front layer
    this.frontLayer[algorithm].removeChild(nodeGfx);
    this.nodesLayer[algorithm].addChild(nodeGfx);
    this.frontLayer[algorithm].removeChild(labelGfx);
    this.labelsLayer[algorithm].addChild(labelGfx);

    // clear hover effect
    const nodeGfxChildren = [...nodeGfx.children];
    for (const child of nodeGfxChildren) {
      if (!this.hoveredNodeGfxOriginalChildren[algorithm].includes(child)) {
        nodeGfx.removeChild(child);
      }
    }
    this.hoveredNodeGfxOriginalChildren[algorithm] = undefined;
    const labelGfxChildren = [...labelGfx.children];
    for (const child of labelGfxChildren) {
      if (!this.hoveredLabelGfxOriginalChildren[algorithm].includes(child)) {
        labelGfx.removeChild(child);
      }
    }
    this.hoveredLabelGfxOriginalChildren[algorithm] = undefined;

    this.requestRender(algorithm);
  }

  /**
   * 移动节点
   * @param nodeData 节点
   * @param point 位置
   */
  moveNode(algorithm, nodeData, point) {
    nodeData.x = point.x;
    nodeData.y = point.y;

    this.update(algorithm);
  }

  /**
   * 鼠标移动
   * @param event 事件
   */
  appMouseMove(event) {
    if (!this.clickedAlgorithm || !this.clickedNodeData[this.clickedAlgorithm]) {
      return;
    }

    this.moveNode(this.clickedAlgorithm, this.clickedNodeData[this.clickedAlgorithm],
      this.viewport[this.clickedAlgorithm].toWorld(event.data.global));
  }

  /**
   * 节点点击效果
   * @param nodeData 节点
   */
  clickNodeStart(algorithm, nodeData) {
    console.log(nodeData);
    this.clickedAlgorithm = algorithm;
    this.clickedNodeData[algorithm] = nodeData;
    // 启动节点拖拽
    this.app[algorithm].renderer.plugins.interaction.on('mousemove', this.appMouseMove, this);
    // 禁用视窗拖拽
    this.viewport[algorithm].pause = true;
  }

  /**
   * 节点松开点击效果
   */
  clickNodeEnd(algorithm) {
    this.clickedAlgorithm = undefined;
    this.clickedNodeData[algorithm] = undefined;
    // 禁用节点拖拽
    this.app[algorithm].renderer.plugins.interaction.off('mousemove', this.appMouseMove, this);
    // 启用视窗拖拽
    this.viewport[algorithm].pause = false;
  }

  /**
   * 边点击效果
   * @param linkData 边
   */
  clickLineStart(algorithm, linkData) {
    this.clickedLineData[algorithm] = linkData;
  }

  /**
   * 边松开点击效果
   */
  clickLineEnd(algorithm) {
    this.clickedLineData[algorithm] = undefined;

    this.update(algorithm);
  }
}

