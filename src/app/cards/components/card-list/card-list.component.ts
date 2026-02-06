import { Component, OnInit } from '@angular/core';
import { CardService } from '../../service/card.service'; 
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports:[
    MatCardModule,
    CommonModule
  ],
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit {
  cards: any[] = [];

  constructor(private cardService: CardService, private router: Router) { }

  ngOnInit(): void {
    this.cardService.getCards().subscribe(cards => {
      this.cards = cards;
    });
  }

  viewCard(id: string) {
    this.router.navigate(['/cards', id]);
  }

  editCard(id: string) {
    this.router.navigate(['/cards', id, 'edit']);
  }

  deleteCard(id: string) {
    this.cardService.deleteCard(id).subscribe(() => {
      this.cards = this.cards.filter(card => card.id !== id);
    });
  }
}
