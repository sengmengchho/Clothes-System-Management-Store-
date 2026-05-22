from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.models import ProductVariant


class OrderItemInputSerializer(serializers.Serializer):
    """Validates each item in the incoming order request."""
    variant_id = serializers.IntegerField()
    quantity   = serializers.IntegerField(min_value=1)

    def validate_variant_id(self, value):
        try:
            ProductVariant.objects.get(pk=value)
        except ProductVariant.DoesNotExist:
            raise serializers.ValidationError(f"Variant {value} not found.")
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    """Used to display order items in responses."""
    subtotal      = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    product_name  = serializers.CharField(source='variant.product.product_name', read_only=True)
    size          = serializers.CharField(source='variant.size', read_only=True)
    color         = serializers.CharField(source='variant.color', read_only=True)
    sku           = serializers.CharField(source='variant.sku', read_only=True)

    class Meta:
        model  = OrderItem
        fields = [
            'item_id', 'variant_id',
            'product_name', 'size', 'color', 'sku',
            'quantity', 'unit_price', 'subtotal',
        ]


class OrderSerializer(serializers.ModelSerializer):
    """Full order with items — used in detail views."""
    items        = OrderItemSerializer(many=True, read_only=True)
    customer_name  = serializers.CharField(source='user.name',  read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model  = Order
        fields = [
            'order_id', 'customer_name', 'customer_email',
            'status', 'shipping_address',
            'total_price', 'ordered_at', 'updated_at',
            'items',
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight — used in lists (no items)."""
    customer_name  = serializers.CharField(source='user.name',  read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    item_count     = serializers.SerializerMethodField()

    class Meta:
        model  = Order
        fields = [
            'order_id', 'customer_name', 'customer_email',
            'status', 'total_price', 'item_count', 'ordered_at',
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class OrderStatusSerializer(serializers.ModelSerializer):
    """Used by Admin / Sale to update order status only."""
    VALID_TRANSITIONS = {
        'Pending':    ['Paid', 'Cancelled'],
        'Paid':       ['Processing', 'Cancelled'],
        'Processing': ['Shipped', 'Cancelled'],
        'Shipped':    ['Delivered'],
        'Delivered':  [],
        'Cancelled':  [],
    }

    class Meta:
        model  = Order
        fields = ['status']

    def validate_status(self, value):
        current = self.instance.status
        allowed = self.VALID_TRANSITIONS.get(current, [])
        if value not in allowed:
            raise serializers.ValidationError(
                f"Cannot change status from '{current}' to '{value}'. "
                f"Allowed: {allowed or 'none (final state)'}."
            )
        return value
