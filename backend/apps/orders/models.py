from django.db import models
from apps.users.models    import User
from apps.products.models import ProductVariant


class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending',    'Pending'),
        ('Paid',       'Paid'),
        ('Processing', 'Processing'),
        ('Shipped',    'Shipped'),
        ('Delivered',  'Delivered'),
        ('Cancelled',  'Cancelled'),
    ]

    order_id         = models.AutoField(primary_key=True)
    user             = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        db_column='user_id',
        related_name='orders',
    )
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    shipping_address = models.TextField()
    total_price      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    ordered_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Orders'
        managed  = False
        ordering = ['-ordered_at']

    def __str__(self):
        return f"Order #{self.order_id} — {self.user.email}"


class OrderItem(models.Model):
    item_id    = models.AutoField(primary_key=True)
    order      = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        db_column='order_id',
        related_name='items',
    )
    variant    = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        db_column='variant_id',
    )
    quantity   = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'Order_Items'
        managed  = False

    @property
    def subtotal(self):
        return self.quantity * self.unit_price
