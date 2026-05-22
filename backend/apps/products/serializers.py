from rest_framework import serializers
from .models import Category, Product, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['category_id', 'name']


# ── Variants ──────────────────────────────────────────────────

class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model  = ProductVariant
        fields = [
            'variant_id', 'size', 'color',
            'stock', 'price', 'effective_price', 'sku',
        ]


class ProductVariantWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductVariant
        fields = ['size', 'color', 'stock', 'price', 'sku']

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value


# ── Products ──────────────────────────────────────────────────

class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight — used on the Home / listing page."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    # cheapest variant price for display
    from_price    = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = [
            'product_id', 'product_name', 'category_name',
            'base_price', 'from_price', 'image_url', 'is_active',
        ]

    def get_from_price(self, obj):
        variants = obj.variants.all()
        prices   = [v.effective_price for v in variants]
        return min(prices) if prices else obj.base_price


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full detail with all variants — used on the Product Detail page."""
    category      = CategorySerializer(read_only=True)
    variants      = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model  = Product
        fields = [
            'product_id', 'product_name', 'category',
            'description', 'base_price', 'image_url',
            'is_active', 'created_at', 'variants',
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    """Used by Admin to create / update a product."""
    class Meta:
        model  = Product
        fields = [
            'category', 'product_name', 'description',
            'base_price', 'image_url', 'is_active',
        ]

    def validate_base_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
