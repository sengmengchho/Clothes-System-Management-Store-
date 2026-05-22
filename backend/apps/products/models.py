from django.db import models


class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name        = models.CharField(max_length=50, unique=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table  = 'Categories'
        managed   = False
        ordering  = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    product_id   = models.AutoField(primary_key=True)
    category     = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        db_column='category_id',
        related_name='products',
    )
    product_name = models.CharField(max_length=100)
    description  = models.TextField(blank=True, null=True)
    base_price   = models.DecimalField(max_digits=10, decimal_places=2)
    image_url    = models.CharField(max_length=255, blank=True, null=True)
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Products'
        managed  = False
        ordering = ['-created_at']

    def __str__(self):
        return self.product_name


class ProductVariant(models.Model):
    SIZE_CHOICES = [
        ('XS', 'XS'), ('S', 'S'), ('M', 'M'),
        ('L', 'L'),   ('XL', 'XL'), ('XXL', 'XXL'),
    ]

    variant_id = models.AutoField(primary_key=True)
    product    = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        db_column='product_id',
        related_name='variants',
    )
    size       = models.CharField(max_length=5, choices=SIZE_CHOICES)
    color      = models.CharField(max_length=30)
    stock      = models.IntegerField(default=0)
    price      = models.DecimalField(max_digits=10, decimal_places=2,
                                     blank=True, null=True)
    sku        = models.CharField(max_length=80, unique=True,
                                  blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Product_Variants'
        managed  = False

    def __str__(self):
        return f"{self.product.product_name} — {self.size} / {self.color}"

    @property
    def effective_price(self):
        """Variant price if set, otherwise fall back to product base_price."""
        return self.price if self.price is not None else self.product.base_price
