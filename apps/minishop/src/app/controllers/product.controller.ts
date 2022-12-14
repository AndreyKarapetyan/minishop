import { JwtAuthGuard } from '@minishop/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { ProductCreateDto } from '@minishop/common/dtos/product/product-create.dto';
import { ProductService } from '@minishop/product/product.service';
import { ProductUpdateDto } from '@minishop/common/dtos/product/product-update.dto';
import { Roles } from '../decorators/role.decorator';
import { PurchaseDto } from '@minishop/common/dtos/purchase.dto';
import { RolesGuard } from '@minishop/auth/guards/role.guard';
import { User, UserRole } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotAcceptableException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Roles(UserRole.Seller)
  @Post()
  async createProduct(
    @Body() productData: ProductCreateDto,
    @CurrentUser() user: User
  ) {
    const product = await this.productService.createProduct(
      productData,
      user.id
    );
    return product;
  }

  @Roles(UserRole.Seller)
  @Get('id/:productId')
  async getProduct(@Param('productId', ParseIntPipe) productId: number) {
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }

  @Roles(UserRole.Seller)
  @Put('id/:productId')
  async updateProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() productData: ProductUpdateDto,
    @CurrentUser() user: User
  ) {
    const product = await this.productService.getProductById(productId);
    if (!product || product.sellerId !== user.id) {
      throw new NotFoundException();
    }
    const updatedProduct = await this.productService.updateProductById(
      productData,
      productId
    );
    return updatedProduct;
  }

  @Roles(UserRole.Buyer)
  @Put('buy')
  async buyProduct(
    @Body() purchaseData: PurchaseDto,
    @CurrentUser() user: User
  ) {
    const { amount, productId } = purchaseData;
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new NotFoundException();
    }
    if (product.amountAvailable < amount) {
      throw new NotAcceptableException(
        'There is no such amount of this product'
      );
    }
    if (user.deposit < amount * product.cost) {
      throw new NotAcceptableException(
        "You don't have enough money for the purchase"
      );
    }
    const data = await this.productService.buyProduct(
      purchaseData,
      user,
      product
    );
    return data;
  }

  @Roles(UserRole.Seller)
  @Delete(':productId')
  async deleteProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: User
  ) {
    const product = await this.productService.getProductById(productId);
    if (!product || product.sellerId !== user.id) {
      throw new NotFoundException();
    }
    await this.productService.deleteProductById(productId);
    return;
  }
}
