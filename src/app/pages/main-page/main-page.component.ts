import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductResponse } from 'src/app/shared/interfaces/product.interface';
import { OrderService } from 'src/app/shared/services/order/order.service';
import { ProductsService } from 'src/app/shared/services/products/products.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
  public adminProducts: Array<ProductResponse> = [];
  private eventSubscription!: Subscription;

  constructor(
    private productsService: ProductsService,
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) {
    this.eventSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadProducts();
      }
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }
  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
  }
  loadProducts(): void {
    this.productsService.getAll().subscribe((data) => {
      this.adminProducts = data;
    });
  }

  countProduct(product: ProductResponse, value: boolean): void {
    if (value) {
      ++product.count;
    } else if (!value && product.count > 1) {
      --product.count;
    }
  }

  addBasket(prod: ProductResponse): void {
    let basket: Array<ProductResponse> = [];
    if (localStorage.length > 0 && localStorage.getItem('basket')) {
      basket = JSON.parse(localStorage.getItem('basket') as string);

      if (basket.some((item) => item.id === prod.id)) {
        const index = basket.findIndex((item) => item.id === prod.id);
        basket[index].count += prod.count;
      } else {
        basket.push(prod);
      }
    } else {
      basket.push(prod);
    }
    localStorage.setItem('basket', JSON.stringify(basket));
    prod.count = 1;
    this.orderService.changeBasket.next(true);
  }
}
