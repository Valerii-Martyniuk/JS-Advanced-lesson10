import {
  Component,
  HostListener,
  OnChanges,
  OnInit,
  reflectComponentType,
} from '@angular/core';
import { CategoryService } from 'src/app/shared/services/category/category.service';
import {
  CategoryRequest,
  CategoryResponse,
} from 'src/app/shared/interfaces/category.interface';
import { ProductResponse } from 'src/app/shared/interfaces/product.interface';
import { Subject } from 'rxjs';
import { OrderService } from 'src/app/shared/services/order/order.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public isBordItem: boolean = false;
  public isNavItems: boolean = false;
  public isBasket: boolean = false;
  public adminCategory: Array<CategoryResponse> = [];
  public basket: Array<ProductResponse> = [];
  public basketInfo = {
    total: 0,
    count: 0,
  };
  public margTop = '';

  constructor(
    private categoryService: CategoryService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadCategorys();
    this.loadBasket();
    this.updateBasket();
  }

  loadCategorys(): void {
    this.categoryService.getAll().subscribe((data) => {
      this.adminCategory = data;
    });
  }
  loadBasket(): void {
    if (localStorage.length > 0 && localStorage.getItem('basket')) {
      this.basket = JSON.parse(localStorage.getItem('basket') as string);
      this.getBasketInfo();
    }
  }
  getBasketInfo(): void {
    this.basketInfo.total = this.basket.reduce(
      (total: number, prod: ProductResponse) =>
        total + prod.count * Number(prod.price),
      0
    );
    this.basketInfo.count = this.basket.length;
  }

  updateBasket(): void {
    this.orderService.changeBasket.subscribe(() => {
      this.loadBasket();
    });
  }
  ////////////BASKET WINDOW /////////////////////////

  countProduct(product: ProductResponse, value: boolean): void {
    if (value) {
      ++product.count;
    }
    if (!value && product.count > 1) {
      --product.count;
    }
    localStorage.setItem('basket', JSON.stringify(this.basket));
    this.orderService.changeBasket.next(true);
  }

  deletBasketProduct(product: ProductResponse): void {
    let index = this.basket.findIndex((item) => item.id === product.id);
    this.basket.splice(index, 1);
    localStorage.setItem('basket', JSON.stringify(this.basket));
    this.orderService.changeBasket.next(true);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 110) {
      this.margTop = String(window.scrollY - 110 + 'px');
    } else if (window.scrollY <= 110) {
      this.margTop = '0px';
    }
  }
}
