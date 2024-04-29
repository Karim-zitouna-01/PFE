import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Emitters} from '../emitters/emitters';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent  {
  cards = [
    {
      title: 'Unlock the hidden potential of your data',
      text: 'Gain valuable insights and make smarter decisions with our powerful data analysis tools.',
      imageUrl: 'https://i.imgur.com/y8UX04C.png',
      buttons: ['Subscribe Now', 'Login Now'],
    },
    {
      title: 'Empower your data with SVS',
      text: 'Discover the power of data transformation and visualization with our self-service platform.',
      imageUrl: 'https://i.imgur.com/y8UX04C.png',
      buttons: ['Start Free Trial', 'Learn More'],
    },
    // Add more cards here
  ];  

}