import {Component, OnInit} from '@angular/core';
import {EdgeData, GraphData, NodeData} from '../shared/graph-data';
import {Router} from '@angular/router';

@Component({
  selector: 'app-graph-form',
  templateUrl: './graph-form.component.html',
  styleUrls: ['./graph-form.component.css']
})
export class GraphFormComponent implements OnInit {

  nodeFileInput: any; // 绑定真正的 File Input
  nodeFileName = ''; // 绑定用来显示文件名的 Text Input
  nodeFile: File; // 待上传的文件
  nodeFileContent: string; // 待上传的文件的文本内容
  nodeFileInvalid = false;
  nodeFileInvalidMessage = '';
  nodeFileHasHeader = true;
  nodeFileLine0: string;
  nodeFileColumns: string[] = [];
  nodeFileIdColumn: number;

  edgeFileInput: any; // 绑定真正的 File Input
  edgeFileName = ''; // 绑定用来显示文件名的 Text Input
  edgeFile: File; // 待上传的文件
  edgeFileContent: string; // 待上传的文件的文本内容
  edgeFileInvalid = false;
  edgeFileInvalidMessage = '';
  edgeFileHasHeader = true;
  edgeFileLine0: string;
  edgeFileColumns: string[] = [];
  edgeFileSourceColumn: number;
  edgeFileTargetColumn: number;

  public graphData: GraphData;

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  loadFile(file: File, loadFileComplete: any, loadFileError: any) {
    const reader = new FileReader();
    reader.onerror = evt => {
      loadFileError('无法解析文件 2');
    };
    reader.onabort = evt => {
    };
    reader.onload = evt => {
      loadFileComplete(reader.result.toString());
    };
    reader.onloadend = evt => {
    };
    reader.onloadstart = evt => {
    };
    reader.onprogress = evt => {
    };
    reader.readAsText(file, 'UTF-8');
  }

  /**
   * 选择节点CSV文件
   * @param event 事件
   */
  onNodeFileChange(event) {
    this.nodeFileName = this.nodeFileInput;
    this.nodeFileInvalid = false;
    this.nodeFileColumns = [];
    this.nodeFileIdColumn = undefined;
    this.nodeFileLine0 = '';

    if (event.target.files && event.target.files[0]) {
      this.loadNodeFile(event.target.files[0]);
    } else {
      this.nodeFileInvalid = true;
      this.nodeFileInvalidMessage = '无法解析文件';
    }
  }

  /**
   * 加载节点文件
   * @param nodeFile 节点文件
   */
  loadNodeFile(nodeFile: File) {
    this.nodeFile = nodeFile;
    this.loadFile(nodeFile, (fileContent: string) => {
      this.nodeFileContent = fileContent;
      if (!this.nodeFileContent) {
        // 文件内容为空
        return;
      }
      const lines = this.nodeFileContent.split('\n');
      if (lines.length === 0) {
        // 文件内容为空
        return;
      }
      this.nodeFileLine0 = lines[0];
      this.loadNodeHeaderColumn();
    }, (errorMessage: string) => {
      this.nodeFileInvalid = true;
      this.nodeFileInvalidMessage = errorMessage ? errorMessage : '无法解析文件';
    });
  }

  /**
   * 切换节点CSV文件是否有header
   * @param event 事件
   */
  onNodesCsvCheckChange(event) {
    this.loadNodeHeaderColumn();
  }

  /**
   * 加载节点CSV文件header
   */
  loadNodeHeaderColumn() {
    if (!this.nodeFileLine0 || this.nodeFileLine0.length === 0) {
      return;
    }
    this.nodeFileColumns = [];
    this.nodeFileIdColumn = undefined;
    const headers = this.nodeFileLine0.split(',');
    if (headers.length > 0) {
      if (this.nodeFileHasHeader) {
        headers.forEach(header => {
          this.nodeFileColumns.push(header.trim());
        });
      } else {
        for (let i = 0; i < headers.length; i++) {
          this.nodeFileColumns.push('col ' + i);
        }
      }
      this.nodeFileIdColumn = 0;
    }
  }

  /**
   * 选择边CSV文件
   * @param event 事件
   */
  onEdgeFileChange(event) {
    this.edgeFileName = this.edgeFileInput;
    this.edgeFileInvalid = false;
    this.edgeFileColumns = [];
    this.edgeFileSourceColumn = undefined;
    this.edgeFileTargetColumn = undefined;
    this.edgeFileLine0 = '';

    if (event.target.files && event.target.files[0]) {
      this.loadEdgeFile(event.target.files[0]);
    } else {
      this.edgeFileInvalid = true;
      this.edgeFileInvalidMessage = '无法解析文件';
    }
  }

  /**
   * 加载边文件
   * @param edgeFile 边文件
   */
  loadEdgeFile(edgeFile: File) {
    this.edgeFile = edgeFile;
    this.loadFile(edgeFile, (fileContent: string) => {
      this.edgeFileContent = fileContent;
      if (!this.edgeFileContent) {
        // 文件内容为空
        return;
      }
      const lines = this.edgeFileContent.split('\n');
      if (lines.length === 0) {
        // 文件内容为空
        return;
      }
      this.edgeFileLine0 = lines[0];
      this.loadEdgeHeaderColumn();
    }, (errorMessage: string) => {
      this.edgeFileInvalid = true;
      this.edgeFileInvalidMessage = errorMessage ? errorMessage : '无法解析文件';
    });
  }

  /**
   * 切换边CSV文件是否有header
   * @param event 事件
   */
  onEdgesCsvCheckChange(event) {
    this.loadEdgeHeaderColumn();
  }

  /**
   * 加载边CSV文件header
   */
  loadEdgeHeaderColumn() {
    if (!this.edgeFileLine0 || this.edgeFileLine0.length === 0) {
      return;
    }
    this.edgeFileColumns = [];
    this.edgeFileSourceColumn = undefined;
    this.edgeFileTargetColumn = undefined;
    const headers = this.edgeFileLine0.split(',');
    if (headers.length > 0) {
      if (this.edgeFileHasHeader) {
        headers.forEach(header => {
          this.edgeFileColumns.push(header.trim());
        });
      } else {
        for (let i = 0; i < headers.length; i++) {
          this.edgeFileColumns.push('col ' + i);
        }
      }
      this.edgeFileSourceColumn = 0;
      this.edgeFileTargetColumn = 0;
    }
  }

  onSubmit() {
    if (!this.nodeFileIdColumn) {
      // 未选择节点ID列
      return;
    }
    if (this.nodeFileIdColumn < 0 || this.nodeFileIdColumn >= this.nodeFileColumns.length) {
      // 需要重新选择节点
      return;
    }
    if (!this.edgeFileSourceColumn) {
      // 未选择起始ID列
      return;
    }
    if (this.edgeFileSourceColumn < 0 || this.edgeFileSourceColumn >= this.edgeFileColumns.length) {
      // 需要重新选择起始ID列
      return;
    }
    if (!this.edgeFileTargetColumn) {
      // 未选择目标ID列
      return;
    }
    if (this.edgeFileTargetColumn < 0 || this.edgeFileTargetColumn >= this.edgeFileColumns.length) {
      // 需要重新选择目标ID列
      return;
    }
    const nodeFileLines = this.nodeFileContent.split('\n');
    const edgeFileLines = this.edgeFileContent.split('\n');

    this.graphData = new GraphData();
    let i = 0;
    nodeFileLines.forEach(line => {
      if (line.length === 0 || (this.nodeFileHasHeader && i === 0)) {
          i++;
          return;
      }
      const columns = line.split(',');
      const node = columns[this.nodeFileIdColumn];
      if (node != null) {
        this.graphData.nodes.push(new NodeData(node));
      }
    });
    i = 0;
    edgeFileLines.forEach(line => {
      if (line.length === 0 || (this.nodeFileHasHeader && i === 0)) {
          i++;
          return;
      }
      const columns = line.split(',');
      const source = columns[this.edgeFileSourceColumn];
      const target = columns[this.edgeFileTargetColumn];
      if (source != null && target != null) {
        this.graphData.links.push(new EdgeData(source.trim(), target.trim()));
      }
    });
    localStorage.setItem('graphData', JSON.stringify(this.graphData));
    this.router.navigate(['./container/graph']);
  }


}
