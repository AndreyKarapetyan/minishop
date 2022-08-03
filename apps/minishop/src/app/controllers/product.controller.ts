import { AuthenticationGuard } from '@minishop/auth/guards/auth.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { ProductCreateDto } from '@minishop/common/dtos/product/product-create.dto';
import { ProductService } from '@minishop/product/product.service';
import { ProductUpdateDto } from '@minishop/common/dtos/product/product-update.dto';
import { Roles } from '../decorators/role.decorator';
import { RolesGuard } from '@minishop/auth/guards/role.guard';
import { User, UserRole } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthenticationGuard, RolesGuard)
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

  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(UserRole.Seller)
  @Get(':productId')
  async getProduct(@Param('productId', ParseIntPipe) productId: number) {
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }

  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(UserRole.Seller)
  @Put(':productId')
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

  @UseGuards(AuthenticationGuard, RolesGuard)
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
