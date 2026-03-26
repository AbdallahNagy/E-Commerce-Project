import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  templateUrl: './star-rating.component.html',
})
export class StarRatingComponent {
  rating = input(0);
  currentRating = input(0);
  small = input(false);
  interactive = input(false);
  ratingChange = output<number>();

  readonly stars = [1, 2, 3, 4, 5];
}
