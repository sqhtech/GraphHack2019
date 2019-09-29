import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  messages: [
    {
      name: 'Nadia Halsey',
      avatar: '',
      status: 1,
      action: 'lorem ipsum dolor sit amit',
      time: '7:40am'
    }
  ];
  tasks: [
    {
      action: '',
      rate: 40,
    }
  ];
  unreadMessageCount: 1;
  unreadTaskCount: 1;

  constructor() { }

  ngOnInit() {
  }

}
