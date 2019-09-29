import { Component, OnInit } from '@angular/core';
import {GraphData} from '../shared/graph-data';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  graphData: GraphData;

  constructor() {
    const graphDataJSON = localStorage.getItem('graphData');
    this.graphData = JSON.parse(graphDataJSON);
  }

  ngOnInit() {
  }

}
